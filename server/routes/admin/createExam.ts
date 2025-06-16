import { Router, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isAdmin } from "../../middleware/auth";
import { AuthRequest } from "../../types/interface";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.post("/", verifyToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, date, time, duration } = req.body;

  if (!title || !description || !date || !time || !duration) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("exams")
      .insert([{ title, description, date, time, duration }]);

    if (error) {
      console.error("Supabase error:", error.message, error.details);
      res.status(500).json({ error: "Failed to create exam" });
      return;
    }

    res.status(201).json({ message: "Exam created successfully", exam: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;