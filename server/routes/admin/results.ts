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

router.get('/api/admin/results/:examId', verifyToken, isAdmin, async (req: Request, res: Response): Promise<any> => {
  const { examId } = req.params;

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

  if (error) return res.status(500).json({ error: error.message });

  const formatted = (data || []).map((r: any) => {
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

  return res.json(formatted);
});

export default router;