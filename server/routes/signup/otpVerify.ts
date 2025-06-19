import dotenv from 'dotenv';
dotenv.config();
import { Router, Request, Response } from "express";
import { supabase } from "../../db/supabase";
import { otpValid } from "../../OTP/otpValid";
import { cleanupExpiredOTPs } from "../../OTP/deleteExpiredOTPs";
import { generateTokens } from "../../libs/tokenGenerator";
import express from "express";
import cors from 'cors';
import { OtpVerify, ActiveState } from '../../types/interface';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION as string;

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { otp, email } = req.body as OtpVerify['body'];
  const { user_email, role, status } = req.body as ActiveState;

  if (!otp) return res.status(400).json({ error: "OTP REQUIRED!" });
  if (!email) return res.status(400).json({ error: "EMAIL REQUIRED!" });

  const isValid = await otpValid('otp_table', email, otp);
  if (!isValid) return res.status(401).json({ error: "OTP IS EXPIRED!" });

  try {
    const { data: otpData, error: otpError } = await supabase
      .from('otp_table')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .single();

    if (otpError) return res.status(500).json({ error: otpError.message });
    if (!otpData) return res.status(404).json({ error: "INVALID OTP OR EMAIL" });

    const { error: updateError } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('email', email)
      .single();

    if (updateError) {
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

    const { data, error } = await supabase
    .from("active")
    .insert([
      {
        user_email: user.email,
        role: user.role,
        status: true
      }
    ]);

    if (data)  res.status(200).json({ success: true, message: "SESSION UPDATED SUCCESSFULLY" });
    else  res.status(500).json({ success: false, error: error?.message || "FAILED TO UPDATE SESSION" });

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

export default router;