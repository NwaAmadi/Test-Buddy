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

router.get("/:id", verifyToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const { data: exam, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error.message, error.details);
      res.status(500).json({ error: "Failed to fetch exam details" });
      return;
    }

    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    res.json(exam);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;