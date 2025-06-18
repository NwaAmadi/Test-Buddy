import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import express from "express";
import { supabase } from "./db/supabase";
import { SignupRequest, LoginRequest, User, OtpVerify, SendOtp } from "./types/interface";
import { OtpEmailTemplate } from "./OTP/OtpEmailTemplate";
import { generateOTP } from "./OTP/otpGenerator";
import { canRequestOTP } from "./OTP/canRequestOTP";
import { cleanupExpiredOTPs } from "./OTP/deleteExpiredOTPs";
import { otpValid } from "./OTP/otpValid";
import { verifyToken, isStudent, AuthRequest } from './middleware/auth';
import { verifyAdminCode } from './admin/verifyAdminAccessCode';
import { generateTokens } from './libs/tokenGenerator';
import * as jose from 'jose';
import nodemailer from 'nodemailer';
import { sendOtpEmail } from './libs/brevo';
import { LoginOtpEmailTemplate } from './OTP/loginOtpTemplate';
import { sendMail } from './mailService/mailTransporter';
import cors from 'cors';
import { login } from './controllers/authController';


import studentDashboardRoute from "./routes/student/dashboard";
import examRoute from "./routes/student/exam";
import resultRoute from "./routes/student/result";
import submitExamRoute from "./routes/student/submitExam";
import allResultsRouter from "./routes/student/allResults";

import examsRoutes from "./routes/admin/exams"
import questionsRoutes from "./routes/admin/questions"
import resultsRoutes from "./routes/admin/results"

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const TEST_BUDDY_EMAIL = process.env.TEST_BUDDY_EMAIL as string;
const TEST_BUDDY_EMAIL_PASSWORD = process.env.TEST_BUDDY_EMAIL_PASSWORD as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION as string;


app.post('/api/signup', async (req: Request, res: Response): Promise<any> => {
  const {
    email,
    first_name,
    last_name,
    role,
    verified,
    access_code
  } = req.body as SignupRequest['body'];


  if (
    !first_name ||
    !last_name ||
    !email ||
    !role ||
    typeof verified !== 'boolean'
  ) {
    return res.status(400).json({ error: "ALL FIELDS ARE REQUIRED" });
  }

  if (role !== "admin" && role !== "student") {
    return res.status(400).json({ message: "INVALID ROLE" });
  }

  try {

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return res.status(500).json({ message: 'ERROR CHECKING EMAIL', error: checkError.message });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'EMAIL ALREADY REGISTERED' });
    }


    if (role === "admin") {
      if (!access_code) {
        return res.status(400).json({ message: 'ACCESS CODE IS REQUIRED FOR ADMIN ROLE' });
      }


      const isValidAdminCode = await verifyAdminCode(email, access_code as string);
      if (!isValidAdminCode) {
        return res.status(400).json({ message: 'INVALID ADMIN ACCESS CODE' });
      }

      const { error: setIsusedError } = await supabase
        .from('admin_access_code')
        .update({ is_used: true })
        .eq('access_code', access_code);

      if (setIsusedError) {
        console.error('Error updating admin access code:', setIsusedError);
        return res.status(500).json({ message: 'ERROR UPDATING ADMIN ACCESS CODE', error: setIsusedError.message });
      }
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        first_name,
        last_name,
        email,
        role,
        verified,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase user insertion error:', insertError);
      return res.status(500).json({ message: 'FAILED TO CREATE USER ACCOUNT', details: insertError.message });
    }


    return res.status(201).json({ message: 'USER REGISTERED SUCCESSFULLY!', user: newUser });
  } catch (error: any) {
    console.error('Signup Error (Catch Block):', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during signup.";
    return res.status(500).json({ error: "INTERNAL SERVER ERROR!", details: errorMessage });
  }
});

app.post('/api/otp-verify', async (req: Request, res: Response): Promise<any> => {
  const { otp, email } = req.body as OtpVerify['body'];

  if (!otp) {
    return res.status(400).json({ error: "OTP REQUIRED!" });
  }
  if (!email) {
    return res.status(400).json({ error: "EMAIL REQUIRED!" });
  }

  const isValid = await otpValid('otp_table', email, otp);
  if (!isValid) {
    return res.status(401).json({ error: "OTP IS EXPIRED!" });
  }

  try {
    const { data: otpData, error: otpError } = await supabase
      .from('otp_table')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .single();

    if (otpError) {
      return res.status(500).json({ error: otpError.message });
    }

    if (!otpData) {
      return res.status(404).json({ error: "INVALID OTP OR EMAIL" });
    }

    const { data: userUpdate, error: updateError } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('email', email)
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: 'COULD NOT VERIFY OTP', details: updateError.message });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(500).json({ error: "COULD NOT FETCH USER AFTER VERIFICATION" });
    }

    const { accessToken, refreshToken } = await generateTokens(
      { email: user.email, role: user.role, id: user.id },
      JWT_SECRET,
      REFRESH_SECRET,
      JWT_EXPIRATION,
      REFRESH_EXPIRATION
    );

    await cleanupExpiredOTPs('otp_table');

    return res.status(200).json({
      message: 'OTP VERIFIED & LOGIN SUCCESSFUL',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (err) {
    return res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

app.post('/api/login/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { email, role } = req.body;
  if (!email || !role) {
    res.status(400).json({ error: "EMAIL AND ROLE REQUIRED" });
    return;
  }

  // Check user exists and role matches
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .single();
  if (userError || !user) {
    res.status(404).json({ error: "USER NOT FOUND" });
    return;
  }
  if (user.role !== role) {
    res.status(403).json({ error: "INVALID ROLE" });
    return;
  }

 
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 min

 
  await supabase.from('login_otps').insert([
    { email, otp, expires_at: expiresAt, is_used: false }
  ]);

  const template = LoginOtpEmailTemplate(otp);
 
  const sendLoginOtpResult = await sendMail(email, template, 'Your Login OTP');
  if (!sendLoginOtpResult.success) {
    console.error('Failed to send OTP email:', sendLoginOtpResult.message);
    res.status(500).json({ error: "FAILED TO SEND OTP" });
    return;
  }
  res.json({ message: "OTP sent to your email" });
});

app.post('/api/login/otp-verify', async (req: Request, res: Response): Promise<any> => {
  const { otp, email, role } = req.body as { otp: string; email: string; role: string };

  if (!otp || !email || !role) {
    return res.status(400).json({ error: "OTP, EMAIL, AND ROLE ARE REQUIRED" });
  }

  try {
    // Cleanup expired OTPs first
    await cleanupExpiredOTPs('login_otps');

    // Fetch latest valid OTP
    const { data: latestOtp, error: otpError } = await supabase
      .from('login_otps')
      .select('*')
      .eq('email', email)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !latestOtp || latestOtp.otp !== otp) {
      return res.status(401).json({ error: "INVALID OR EXPIRED OTP" });
    }

    
    const { error: updateError } = await supabase
      .from('login_otps')
      .update({ is_used: true })
      .eq('id', latestOtp.id);

    if (updateError) {
      return res.status(500).json({ error: "FAILED TO MARK OTP AS USED" });
    }

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(500).json({ error: "USER NOT FOUND" });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: "ROLE MISMATCH" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(
      { email: user.email, role: user.role, id: user.id },
      JWT_SECRET,
      REFRESH_SECRET,
      JWT_EXPIRATION,
      REFRESH_EXPIRATION
    );

    return res.status(200).json({
      message: 'OTP VERIFIED & LOGIN SUCCESSFUL',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (err) {
    console.error("OTP VERIFICATION ERROR", err);
    return res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});




app.post('/api/sendOtp', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body as SendOtp['body'];

    if (!email) {
      return res.status(400).json({ error: "EMAIL REQUIRED!" });
    }

    const canRequest = await canRequestOTP(email);
    if (!canRequest) {
      return res.status(429).json({ error: "TOO MANY REQUESTS" });
    }

    const user: User = {
      email,
      first_name: '',
      last_name: '',
      role: 'admin',
      verified: false,
      access_code: ''
    };

    let otp;
    try {
      otp = await generateOTP(user);
    } catch (err) {
      console.error('generateOTP error:', err);
      return res.status(500).json({ error: 'FAILED TO GENERATE OTP' });
    }

    let mail;
    try {
      mail = OtpEmailTemplate(otp);
    } catch (err) {
      console.error('OtpEmailTemplate error:', err);
      return res.status(500).json({ error: 'FAILED TO GENERATE EMAIL TEMPLATE' });
    }

    let emailResult;
    try {
      emailResult = await sendOtpEmail(user.email, mail);
    } catch (err) {
      console.error('sendOtpEmail error:', err);
      return res.status(500).json({ error: 'FAILED TO SEND OTP EMAIL' });
    }

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.message);
      return res.status(500).json({ error: 'FAILED TO SEND OTP' });
    }
    res.status(200).json({ message: 'OTP SENT SUCCESSFULLY' });

  } catch (error) {
    console.error('General Error:', error instanceof Error ? error.stack : error);
    res.status(500).json({ message: 'SOMETHING WENT WRONG' });
  }
});

app.use("/api/student", studentDashboardRoute);
app.use('/api/exam', examRoute);
app.use("/api/result", resultRoute);
app.use("/api/exam-submission", submitExamRoute);
app.use("/student/results", allResultsRouter);

app.use("/api/admin/exam", examsRoutes)
app.use("/api/admin/questions", questionsRoutes)
app.use("/api/admin/results", resultsRoutes)

app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});
