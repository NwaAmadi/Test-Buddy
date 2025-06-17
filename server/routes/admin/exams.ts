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
      res.status(500).json({ error: error.message })
      return
    }
    res.json(exams)
  } catch (err) {
    res.status(500).json({ error: "An unexpected error occurred." })
  }
})

export default router