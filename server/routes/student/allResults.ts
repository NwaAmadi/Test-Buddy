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

router.get("/", verifyToken, isStudent, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  // Fetch results
  const { data: results, error: resultsError } = await supabase
    .from("results")
    .select("*")
    .eq("student_id", userId);

  if (resultsError || !results || results.length === 0) {
    res.status(404).json({ error: "No results found for this student" });
    return;
  }

  // Fetch exams
  const { data: exams, error: examsError } = await supabase
    .from("exams")
    .select("id, title");

  if (examsError || !exams) {
    res.status(500).json({ error: "Failed to fetch exams" });
    return;
  }

  // Format results by matching exam_id to exam title
  const formattedResults = results.map((result) => {
    const exam = exams.find((e) => e.id === result.exam_id);
    return {
      id: result.id,
      examTitle: exam?.title ?? "Unknown Exam",
      score: result.score,
      total: result.total,
      passed: result.passed,
      answers: result.answers,
    };
  });

  res.json(formattedResults);
});

export default router;
