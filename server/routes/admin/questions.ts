import { Router, Request, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isAdmin } from "../../middleware/auth";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();


router.get("/:examId", verifyToken, isAdmin, async (req, res) => {
  const { examId } = req.params;
  try {
    const { data: questions, error } = await supabase.from("questions").select("*").eq("exam_id", examId);
    if (error) throw error;
    res.json(questions);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});


router.post("/:examId", verifyToken, isAdmin, async (
  req: Request,
  res: Response
): Promise<void> => {
  const { examId } = req.params;
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    res.status(400).json({ error: "Request body must contain a non-empty 'questions' array." });
    return; // ensure we return void
  }

  try {
    const questionsToInsert = questions.map((question: any) => ({
      exam_id: examId,
      text: question.text,
      question_type: question.question_type,
      position: question.position,
      options: question.options,
      correct_answer: question.correct_answer,
    }));

    const { data, error } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error inserting questions:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});


router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

export default router;