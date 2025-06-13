import { Router, Response } from "express";
import { supabase } from "../../db/supabase";
import { verifyToken, isStudent } from "../../middleware/auth";
import { AuthRequest } from "../../types/interface";
import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

const router = Router();

router.get('/dashboard', verifyToken, isStudent, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user!.email;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: examsRaw, error: examsError } = await supabase
      .from('exams')
      .select('id, title, date, time, duration')
      .gte('date', today)
      .order('date', { ascending: true });

    if (examsError || !examsRaw) {
      res.status(500).json({ error: "Could not fetch exams" });
      return;
    }

    const availableExams = examsRaw.map(exam => ({
      id: exam.id,
      title: exam.title,
      date: formatDate(exam.date),
      time: formatTime(exam.time),
      duration: formatDuration(exam.duration),
      status: "Not Started",
    }));

    res.json({ availableExams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

// --- Utility Functions ---

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeString: string): string {
  const [hour, minute] = timeString.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(duration: number): string {
  if (!duration || isNaN(duration)) return "N/A";
  if (duration % 60 === 0) {
    return `${duration / 60} hour${duration === 60 ? '' : 's'}`;
  }
  return `${(duration / 60).toFixed(1)} hours`;
}

export default router;
