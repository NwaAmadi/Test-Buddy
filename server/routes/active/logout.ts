import express from "express"
import { supabase } from "../../db/supabase"
import { Request, Response } from "express"

const router = express.Router()

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { email, role } = req.body

  if (!email || !role) {
    return res.status(400).json({ error: "Missing email or role" })
  }

  const { error } = await supabase
    .from("active")
    .update({ status: false })
    .eq("email", email)
    .eq("role", role)

  if (error) {
    return res.status(500).json({ error: "Failed to update status" })
  }

  return res.json({ message: "Logout successful" })
})

export default router
