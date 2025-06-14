import { Router, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isStudent } from "../../middleware/auth";
import { AuthRequest } from "../../types/interface";
import cors from "cors";
import express from "express";


const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.get("/:resultId", verifyToken, isStudent, async (req: AuthRequest, res: Response): Promise<void> => {
  const { resultId } = req.params;
  const userId = req.user!.id;

  
  const { data: result, error } = await supabase
    .from("results")
    .select("*, exams(title)")
    .eq("id", resultId)
    .single();

  if (error || !result) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  if (result.student_id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json({
    examTitle: result.exams.title,
    score: result.score,
    total: result.total,
    passed: result.passed,
    answers: result.answers,
  });
});

export default router;