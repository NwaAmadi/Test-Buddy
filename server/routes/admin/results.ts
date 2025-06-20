import { Router, Request, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isAdmin } from "../../middleware/auth";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

type ResultRow = {
  score: number;
  total: number;
  passed: boolean;
  student: {
    first_name: string;
    last_name: string;
    email: string;
  };
  exam: {
    title: string;
  };
};

router.get('/results/:examId', verifyToken, isAdmin, async (req: Request, res: Response): Promise<any> => {
  const { examId } = req.params;

  if (!examId) {
    console.error("❌ Missing examId");
    return res.status(400).json({ error: "Missing examId" });
  }

  console.log("🔎 Fetching results for examId:", examId);

  const { data, error } = await supabase
    .from('results')
    .select(`
      score,
      total,
      passed,
      student:student_id (
        first_name,
        last_name,
        email
      ),
      exam:exam_id (
        title
      )
    `)
    .eq('exam_id', examId);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ No results found for this exam.");
    return res.status(404).json({ error: "No results found for this exam" });
  }

  console.log("✅ Raw Supabase data:", data);

  const formatted = data.map((r: any) => {
    const student = (r.student ?? {}) as ResultRow["student"];
    const exam = (r.exam ?? {}) as ResultRow["exam"];

    return {
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      score: ((r.score / r.total) * 100).toFixed(2),
      passed: r.passed,
      exam_title: exam.title,
    };
  });

  console.log("✅ Formatted results:", formatted);

  return res.json(formatted);
});

export default router;
