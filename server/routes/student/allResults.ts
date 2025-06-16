import { Router, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isStudent } from "../../middleware/auth";
import { AuthRequest, StudentExamResult } from "../../types/interface"; 
import { PostgrestError } from '@supabase/supabase-js';
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.get("/", verifyToken, isStudent, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    console.error("User ID is missing or invalid");
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const { data: results, error } = await supabase
      .rpc('get_student_results_with_exam_title', { p_student_id: userId }) as { data: StudentExamResult[] | null; error: PostgrestError | null };

    if (error) {
      console.error("Supabase RPC error:", error.message, error.details);
      res.status(500).json({ error: "Failed to fetch results" });
      return;
    }

    if (!results || results.length === 0) {
      res.status(404).json({ error: "No results found for this student" });
      return;
    }

    const formattedResults = results.map((result: StudentExamResult) => ({
      id: result.id,
      examTitle: result.exam_title ?? "Unknown Exam",
      score: result.score,
      total: result.total,
      passed: result.passed,
      answers: result.answers,
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;