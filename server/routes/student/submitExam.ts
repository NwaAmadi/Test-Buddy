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

router.post("/:examId/submit", verifyToken, isStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const userId = req.user?.id;
    const { answers } = req.body;

    console.log("Exam ID:", examId);
    console.log("User ID:", userId);

    if (!answers || Object.keys(answers).length === 0) {
      res.status(400).json({ error: "Answers are required" });
      return;
    }

    const { data: submission, error: submissionError } = await supabase
      .from("results")
      .select("id")
      .eq("exam_id", examId)
      .eq("student_id", userId)
      .maybeSingle();

    if (submissionError) {
      console.error("Supabase Query Error:", submissionError);
      res.status(500).json({ error: "Internal Server Error: Could not check exam submission status" });
      return;
    }

    if (submission) {
      res.status(403).json({ error: "You have already submitted this exam" });
      return;
    }

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, duration")
      .eq("id", examId)
      .single();

    if (examError || !exam) throw new Error("Exam not found");

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, correct_answer")
      .eq("exam_id", examId);

    if (questionsError) throw new Error("Could not fetch questions");

    let score = 0;
    const total = questions.length;
    const answerDetails = questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        selectedOption: selected,
        correctOption: q.correct_answer,
        isCorrect,
      };
    });

    const { data: result, error: resultError } = await supabase
      .from("results")
      .insert([{
        student_id: userId,
        exam_id: examId,
        score,
        total,
        passed: score >= Math.ceil(total * 0.5),
        answers: answerDetails,
      }])
      .select("id")
      .single();

    if (resultError) throw new Error("Could not save result");

    res.json({ resultId: result.id });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  }
});

export default router;