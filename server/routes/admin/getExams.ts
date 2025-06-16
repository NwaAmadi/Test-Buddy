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

router.get("/", verifyToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: exams, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error.message, error.details);
      res.status(500).json({ error: "Failed to fetch exams" });
      return;
    }

    res.json(exams);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;