import { Router, Request, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyAdminCode } from "../../admin/verifyAdminAccessCode";
import express from "express";
import cors from 'cors';
import { SignupRequest } from "../../types/interface";
const app = express();

app.use(cors());
app.use(express.json());

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { email, first_name, last_name, role, verified, access_code } = req.body as SignupRequest['body'];

  if (!first_name || !last_name || !email || !role || typeof verified !== 'boolean') {
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

      const { error: setIsusedError } = await supabase
        .from('admin_access_code')
        .update({ is_used: true })
        .eq('access_code', access_code);

      if (setIsusedError) {
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
      return res.status(500).json({ message: 'FAILED TO CREATE USER ACCOUNT', details: insertError.message });
    }

    return res.status(201).json({ message: 'USER REGISTERED SUCCESSFULLY!', user: newUser });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during signup.";
    return res.status(500).json({ error: "INTERNAL SERVER ERROR!", details: errorMessage });
  }
});

export default router;