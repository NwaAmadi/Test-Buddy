import express from "express"
import { Request, Response } from "express"
import { supabase } from "../../db/supabase"
import { verifyToken, isStudent } from "../../middleware/auth"
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());


const router = express.Router()

router.post("/report-violation", verifyToken, isStudent, async (req: Request, res: Response): Promise<any> => {
  try {
    const { student_id, exam_id, reason, image, timestamp } = req.body

    if (!image || !reason || !student_id || !exam_id) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const imageBuffer = Buffer.from(image.split(",")[1], "base64")
    const filename = `${student_id}_${exam_id}_${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from("testbuddy")
      .upload(filename, imageBuffer, {
        contentType: "image/png",
      })

    if (uploadError) {
      console.error("Failed to upload image:", uploadError)
      return res.status(500).json({ error: "Image upload failed" })
    }

    const { data } = supabase.storage
      .from("testbuddy")
      .getPublicUrl(filename)

    const publicUrl = data?.publicUrl

    if (!publicUrl) {
      return res.status(500).json({ error: "Failed to retrieve image URL" })
    }

    const { error: insertError } = await supabase.from("violations").insert({
      student_id,
      exam_id,
      reason,
      image_url: publicUrl,
      timestamp: timestamp || new Date().toISOString(),
    })

    if (insertError) {
      console.error("Database insert error:", insertError)
      return res.status(500).json({ error: "Failed to save violation to DB" })
    }

    return res.status(200).json({
      message: "Violation reported successfully",
      image_url: publicUrl,
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
