import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, Router } from "express";
import express from "express";
import { supabase } from "../../db/supabase";
import { cleanupExpiredOTPs } from "../../OTP/deleteExpiredOTPs";
import { generateTokens } from "../../libs/tokenGenerator";
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION as string;

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { otp, email, role } = req.body as { otp: string; email: string; role: string };

  if (!otp || !email || !role) {
    return res.status(400).json({ error: "OTP, EMAIL, AND ROLE ARE REQUIRED" });
  }

  try {
    await cleanupExpiredOTPs('login_otps');
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

    const { data, error } = await supabase
    .from("active")
    .insert([
      {
        email: user.email,
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

export default router;