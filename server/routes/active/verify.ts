import express from "express";
import { Request, Response } from "express";
import { supabase } from "../../db/supabase";

const router = express.Router();



router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ success: false, error: " MISSING EMAIL OR ROLE " });
  }

  const { data, error } = await supabase
    .from("active")
    .select("id")
    .eq("email", email)
    .eq("role", role)
    .eq("status", true)
    .maybeSingle();

  
  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  if (data) {
    return res.json({ success: true, message: "Please log out from your other device" });
  }

  return res.json({ success: false, message: "PROCEED" });
});

export default router;
