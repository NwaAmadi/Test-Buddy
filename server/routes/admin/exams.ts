import { Router, Request, Response } from "express"
import { supabase } from "../../db/supabase"
import { verifyToken, isAdmin } from "../../middleware/auth"
import cors from "cors"
import express from "express"

const app = express()
app.use(cors())
app.use(express.json())

const router = Router()

router.get("/", verifyToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: exams, error } = await supabase.from("exams").select("*")
    if (error) {
      console.error("Supabase Error:", error)
      res.status(500).json({ error: error.message })
      return
    }
    res.json(exams)
  } catch (err: unknown) {
    console.error("Unexpected Error:", err)
    const error = err as Error
    res.status(500).json({ error: error.message || "Unexpected error." })
  }
})

router.post("/", verifyToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, duration, date, time, status } = req.body

  if (!title || !duration || !date || !time) {
    res.status(400).json({ error: "Missing required fields" })
    return
  }

  try {
    const { data, error } = await supabase
      .from("exams")
      .insert([{
        title,
        duration: parseInt(duration),
        date,
        time,
        status: status || "Not Started"
      }])
      .select()

    if (error) throw error

    res.status(201).json(data)
  } catch (err: unknown) {
    const error = err as Error
    console.error("Insert Error:", error.message)
    res.status(500).json({ error: error.message || "Unexpected error." })
  }
})

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    try {
      // Trying to delete related questions
      const { error: questionError } = await supabase
        .from("questions")
        .delete()
        .eq("exam_id", id)

      if (questionError) {
        console.error("Failed to delete related questions:", questionError.message)
        throw questionError
      }

      
      const { error: examError } = await supabase
        .from("exams")
        .delete()
        .eq("id", id)

      if (examError) {
        console.error("Failed to delete exam:", examError.message)
        throw examError
      }

      res.status(204).send()
    } catch (err: unknown) {
      const error = err as Error
      console.error("Delete Error:", error.message)
      res.status(500).json({ error: error.message || "Unexpected error." })
    }
  }
)


export default router