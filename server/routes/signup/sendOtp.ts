import dotenv from 'dotenv';
dotenv.config();
import { Router, Request, Response } from "express";
import { canRequestOTP } from "../../OTP/canRequestOTP";
import { generateOTP } from "../../OTP/otpGenerator";
import { OtpEmailTemplate } from "../../OTP/OtpEmailTemplate";
import { sendOtpEmail } from "../../libs/brevo";
import { User, SendOtp } from "../../types/interface";
import express from "express";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();


router.post('/', async (req: Request, res: Response): Promise<any> => {
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

export default router