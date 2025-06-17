import { Router } from "express"
import { supabase } from "../../db/supabase"
import { verifyToken, isAdmin } from "../../middleware/auth"
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router()

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { data: exams, error } = await supabase.from("exams").select("*")
    if (error) {
      console.error("Supabase Error:", error) // Log Supabase error
      res.status(500).json({ error: error.message })
      return
    }
    res.json(exams)
  } catch (err: unknown) {
    console.error("Unexpected Error:", err) 
    const error = err as Error
    res.status(500).json({ error: error.message || "An unexpected error occurred." })
  }
})

router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { title, duration, date, time, status } = req.body;
  try {
    const { data, error } = await supabase
      .from("exams")
      .insert([{ title, duration, date, time, status }])
      .select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Unexpected Error:", error.message); 
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err: unknown) {
    const error = err as Error; 
    console.error("Unexpected Error:", error.message);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

export default router