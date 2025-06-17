import { Router } from "express";
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


router.post("/:examId", verifyToken, isAdmin, async (req, res) => {
  const { examId } = req.params;
  const { text, question_type, position, options, correct_answer } = req.body;
  try {
    const { data, error } = await supabase.from("questions").insert([
      { exam_id: examId, text, question_type, position, options, correct_answer },
    ]);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: unknown) {
    const error = err as Error;
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