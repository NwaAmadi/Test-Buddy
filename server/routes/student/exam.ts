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

router.get("/:examId", verifyToken, isStudent, async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const userId = req.user?.id;

  // Checking if the student has already submitted the exam
  const { data: submission, error: submissionError } = await supabase
    .from("results")
    .select("id")
    .eq("exam_id", examId)
    .eq("student_id", userId)
    .single();

  if (submissionError) {
    res.status(500).json({ error: "Could not check exam submission status" });
    return;
  }

  if (submission) {
    res.status(403).json({ error: "You have already submitted this exam" });
    return;
  }

  // Fetch exam details
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("id, title, date, time, duration")
    .eq("id", examId)
    .single();

  if (examError || !exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, text, question_type, position, options")
    .eq("exam_id", examId)
    .order("position", { ascending: true });

  if (questionsError) {
    res.status(500).json({ error: "Could not fetch questions" });
    return;
  }

  res.json({ ...exam, questions });
});

export default router;