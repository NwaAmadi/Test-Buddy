import { Router, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isStudent } from "../../middleware/auth";
import { AuthRequest, RawResult } from "../../types/interface";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.get("/", verifyToken, isStudent, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  const { data: results, error } = await supabase
    .from("results")
    .select("id, score, total, passed, answers, exams(title)")
    .eq("student_id", userId);

  if (error || !results || results.length === 0) {
    res.status(404).json({ error: "No results found for this student" });
    return;
  }

  const formattedResults = (results as RawResult[]).map((result) => ({
  id: result.id,
  examTitle: result.exams?.[0]?.title ?? "Unknown Exam",
  score: result.score,
  total: result.total,
  passed: result.passed,
  answers: result.answers,
}));

  res.json(formattedResults);
});

export default router;