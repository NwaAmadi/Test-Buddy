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
import { verifyAdminCode } from './admin_access_code/verifyAdminAccessCode';
import  * as jose from 'jose';
import nodemailer from 'nodemailer';
import cors from 'cors';


const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const TEST_BUDDY_EMAIL = process.env.TEST_BUDDY_EMAIL as string;
const TEST_BUDDY_EMAIL_PASSWORD = process.env.TEST_BUDDY_EMAIL_PASSWORD as string;


app.use(cors({
  origin: 'http://192.168.0.107:3000', 
  credentials: true
}));

app.post('/api/signup', async (req: Request, res: Response): Promise<any> => {
  const {
    email,
    first_name,
    last_name,
    password_hash: rawPassword,
    role,
    verified,
    accessCode
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
      .select('*')
      .eq('email', email)
      .single();
  

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ message: 'ERROR CHECKING EMAIL', error: checkError.message });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'EMAIL ALREADY REGISTERED' });
    }

    if (role == 'admin') {
      isAdmin
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const { error } = await supabase
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

    if (error) {
      return res.status(500).json({ message: 'COULD NOT REGISTER USER', error: error.message });
    }

    return res.status(201).json({ message: 'USER REGISTERED SUCCESSFULLY!' });

  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ error: "INTERNAL SERVER ERROR!" });
  }
});

app.post('/api/otp-verify', async (req: Request, res: Response): Promise<any> => {
  const { otp, email} = req.body as OtpVerify['body'];

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
      .from('otp-table')
      .select('*')
      .eq('otp', otp)
      .single();

    if (otpError) {
      return res.status(500).json({ error: otpError.message });
    }

    if (!otpData) {
      return res.status(404).json({ error: "INVALID OTP" });
    }

    const { data: userUpdate, error: updateError } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('email', otpData.email)
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'COULD NOT VERIFY OTP' });
    }

    cleanupExpiredOTPs();
    return res.status(200).json({ message: 'OTP VERIFIED SUCCESSFULLY' });
    
    

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
      return res.status(401).json({ error: "INVALID CREDENTIALS" });
    }

    const isMatch = await bcrypt.compare(password, data.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "INVALID CREDENTIALS" });
    }

    if (!data.verified) {
      return res.status(401).json({ error: "EMAIL NOT VERIFIED" });
    }

 

    const secret = new TextEncoder().encode(JWT_SECRET)
    const alg = 'HS256'
    
    const token = await new jose.SignJWT({ email: data.email, role: data.role })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(secret)


    res.status(200).json({ message: "LOGIN SUCCESSFUL", token });

  } catch (error) {
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});


app.post('/api/sendOtp', async (req: Request, res: Response): Promise<any> => {
  
  const{ email, generateOTP } = req.body as SendOtp['body'];
  const canRequest = await canRequestOTP(email);
  
  if (!canRequest) {
    return res.status(429).json({ error: "TOO MANY REQUESTS" });
  }

  const otp = generateOTP();
  const mail = OtpEmailTemplate(otp);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: TEST_BUDDY_EMAIL,
      pass: TEST_BUDDY_EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: TEST_BUDDY_EMAIL,
    to: email,
    subject: 'HI, Your OTP Code',
    html: mail
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP SENT SUCCESSFULLY'})
    

  } catch (error) {
    res.status(500).json({ message: 'ERROR SENDING OTP'})
  }


});

app.listen(PORT, () => {
  console.log(`ACTIVE ON  ${PORT}`);
});
