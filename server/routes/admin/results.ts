import { Router } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isAdmin } from "../../middleware/auth";
import { ExamResult, GetExamResultsParams } from "../../types/interface";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.get("/:examId", verifyToken, isAdmin, async (req, res) => {
  const { examId } = req.params;
  try {
    const { data: results, error } = await supabase
      .rpc("get_exam_results", { exam_id: examId });

    if (error) throw error;

    res.json(results);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});


router.get("/:examId/csv", verifyToken, isAdmin, async (req, res) => {
  const { examId } = req.params;
  try {
    const { data, error } = await supabase
      .rpc("get_exam_results", { exam_id: examId });

    if (error) throw error;

    const results = data as ExamResult[];

    const csvRows = [
      "Student ID,First Name,Last Name,Score,Total,Passed,Submitted At",
      ...results.map((result) => [
        result.student_id,
        result.first_name || "",
        result.last_name || "",
        result.score,
        result.total,
        result.passed ? "Yes" : "No",
        new Date(result.submitted_at).toISOString(),
      ].join(","))
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=results-${examId}.csv`);
    res.send(csvRows.join("\n"));
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

export default router;