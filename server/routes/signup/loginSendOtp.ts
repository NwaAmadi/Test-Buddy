import dotenv from 'dotenv';
dotenv.config();
import { Router, Request, Response } from "express";
import { supabase } from "../../db/supabase";
import { LoginOtpEmailTemplate } from "../../OTP/loginOtpTemplate";
import { sendMail } from "../../mailService/mailTransporter";
import express from "express";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { email, role } = req.body;
  if (!email || !role) {
    res.status(400).json({ error: "EMAIL AND ROLE REQUIRED" });
    return;
  }

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
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  await supabase.from('login_otps').insert([
    { email, otp, expires_at: expiresAt, is_used: false }
  ]);

  const template = LoginOtpEmailTemplate(otp);

  const sendLoginOtpResult = await sendMail(email, template, 'Your Login OTP');
  if (!sendLoginOtpResult.success) {
    res.status(500).json({ error: "FAILED TO SEND OTP" });
    return;
  }
  res.json({ message: "OTP sent to your email" });
});

export default router;