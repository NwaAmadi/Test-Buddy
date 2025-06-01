import dotenv from 'dotenv';
dotenv.config();
import {Request, Response} from "express";
import bcrypt from 'bcryptjs';
import express from "express";
import { supabase } from "./db/supabase";
import { SignupRequest, LoginRequest, User, OtpVerify, SendOtp } from "./types/interface";
import { OtpEmailTemplate } from "./OTP/OtpEmailTemplate";
import { generateOTP }  from "./OTP/otpGenerator";
import { canRequestOTP } from "./OTP/canRequestOTP";
import { cleanupExpiredOTPs } from "./OTP/deleteExpiredOTPs";
import { otpValid } from "./OTP/otpValid";
import { verifyToken, isAdmin, isStudent } from './middleware/auth';
import { verifyAdminCode } from './admin/verifyAdminAccessCode';
import { generateTokens } from './libs/tokenGenerator';
import  * as jose from 'jose';
import nodemailer from 'nodemailer';
import { sendOtpEmail } from './libs/brevo';
import cors from 'cors';


const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const TEST_BUDDY_EMAIL = process.env.TEST_BUDDY_EMAIL as string;
const TEST_BUDDY_EMAIL_PASSWORD = process.env.TEST_BUDDY_EMAIL_PASSWORD as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION as string;


app.use(cors());

app.post('/api/signup', async (req: Request, res: Response): Promise<any> => {
  const {
    email,
    first_name,
    last_name,
    password_hash: rawPassword,
    role,
    verified,
    access_code 
  } = req.body as SignupRequest['body'];
 
  if (
    !first_name ||
    !last_name ||
    !email ||
    !rawPassword ||
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

      const setIsused = await supabase
        .from('admin_access_codes')
        .update({ isUsed: true })
        .eq('code', access_code)
        .single();
      if (setIsused.error) {
        return res.status(500).json({ message: 'ERROR UPDATING ADMIN ACCESS CODE', error: setIsused.error.message });
      }
    }
    
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          first_name,
          last_name,
          email,
          password_hash: passwordHash,
          role,
          verified
        }
      ]);

    if (insertError) {
      return res.status(500).json({ message: 'COULD NOT REGISTER USER', error: insertError.message });
    }

    return res.status(201).json({ message: 'USER REGISTERED SUCCESSFULLY!' });

  } catch (error: any) {
    console.error('Signup Error:', error);
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

  const isValid = await otpValid(email, otp);
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
      { email: user.email, role: user.role },
      JWT_SECRET,
      REFRESH_SECRET,
      JWT_EXPIRATION,
      REFRESH_EXPIRATION
    );

    await cleanupExpiredOTPs();

    return res.status(200).json({
      message: 'OTP VERIFIED & LOGIN SUCCESSFUL',
      accessToken,
      refreshToken,
      user: {
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


app.post('/api/login', isAdmin, async (req: Request, res: Response): Promise<any> => {
  const { email, password, role } = req.body as LoginRequest['body'];

  if (!email || !password || !role) {
    return res.status(400).json({ error: "ALL FIELDS ARE REQUIRED" });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }

    if (!data) {
      return res.status(404).json({ error: "USER NOT FOUND!" });
    }

    const isMatch = await bcrypt.compare(password, data.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "INVALID CREDENTIALS!" });
    }

    if (!data.verified) {
      return res.status(401).json({ error: "USER NOT VERIFIED!" });
    }
    
    const { accessToken, refreshToken } = await generateTokens(
      { email: data.email, role: data.role },
      JWT_SECRET,
      REFRESH_SECRET,
      JWT_EXPIRATION,
      REFRESH_EXPIRATION
    );
    return res.status(200).json({
      message: "LOGIN SUCCESSFUL",
      accessToken,
      refreshToken,
      user: {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        verified: data.verified
      }
    });

  } catch (error) {
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
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
      password_hash: '',
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


app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});
