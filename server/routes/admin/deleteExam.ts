import { Router, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isAdmin } from "../../middleware/auth";
import { AuthRequest } from "../../types/interface";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.delete("/:id", verifyToken, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error.message, error.details);
      res.status(500).json({ error: "Failed to delete exam" });
      return;
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;