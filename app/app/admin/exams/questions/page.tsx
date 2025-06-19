"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

type Option = {
  id: string;
  text: string;
};

type Question = {
  text: string;
  question_type: string;
  position: number;
  options: Option[];
  correct_answer: string | null;
};

type Exam = {
  id: string;
  title: string;
};

export default function QuestionsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      if (!BACKEND_URL) {
        toast.info("Server configuration error. Please contact support.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.info("Please log in to access exams.");
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/exam`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error: ${res.status}`);
        }

        const data = await res.json();
        setExams(data);
      } catch (err) {
        toast.info(err instanceof Error ? err.message : "Failed to load exams.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [router]);

  const handleExamSelection = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (exam) {
      setSelectedExam(exam);
      setQuestions([
        {
          text: "",
          question_type: "multiple_choice",
          position: 1,
          options: [
            { id: "a", text: "" },
            { id: "b", text: "" },
            { id: "c", text: "" },
          ],
          correct_answer: null,
        },
      ]);
    } else {
      toast.info("Selected exam not found.");
    }
  };

  const handleQuestionChange = (index: number, key: keyof Question, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [key]: key === "text" ? (value || "") : value,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, key: keyof Option, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = {
      ...options[optionIndex],
      [key]: value || "",
    };
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options.push({ id: String.fromCharCode(97 + options.length), text: "" });
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];

    if (options.length <= 1) {
      toast.info("Each question must have at least one option.");
      return;
    }

    options.splice(optionIndex, 1);
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (questions.length >= 100) {
      toast.info("Maximum 100 questions allowed per exam.");
      return;
    }

    setQuestions([
      ...questions,
      {
        text: "",
        question_type: "multiple_choice",
        position: questions.length + 1,
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
        ],
        correct_answer: null,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      position: i + 1,
    }));
    setQuestions(reorderedQuestions);
  };

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("UNAUTHORIZED!");
      router.push("/login");
      return;
    }

    if (!selectedExam) {
      toast.info("Please select an exam.");
      return;
    }

    const invalidQuestions = questions.filter((q) => !q.text || !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast.info("All questions must have text.");
      return;
    }

    const invalidOptions = questions.some((q) =>
      q.options.some((option) => !option.text || !option.text.trim())
    );
    if (invalidOptions) {
      toast.info("All options must have text.");
      return;
    }

    const missingCorrectAnswers = questions.some((q) => !q.correct_answer);
    if (missingCorrectAnswers) {
      toast.info("Each question must have a correct answer selected.");
      return;
    }

    const invalidCorrectAnswers = questions.some((q) =>
      !q.options.some((option) => option.id === q.correct_answer)
    );
    if (invalidCorrectAnswers) {
      toast.info("Some questions have invalid correct answers selected.");
      return;
    }

    try {
      const formattedQuestions = questions.map((q) => ({
        text: (q.text || "").trim(),
        question_type: q.question_type,
        position: q.position,
        options: q.options.map((option) => ({
          ...option,
          text: (option.text || "").trim(),
        })),
        correct_answer: q.correct_answer,
      }));

      const payload = { questions: formattedQuestions };

      const res = await fetch(`${BACKEND_URL}/api/admin/questions/${selectedExam.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit questions.");
      }

      toast.success(`${questions.length} question${questions.length !== 1 ? "s" : ""} added successfully!`);
      setSelectedExam(null);
      setQuestions([]);
    } catch (err) {
      console.error("Submit error:", err);
      toast.info(err instanceof Error ? err.message : "Failed to submit questions.");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 max-w-4xl mx-auto">
        {!selectedExam ? (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Select Exam</h1>
            {isLoading ? (
              <Modal title="Loading Exams" description="Please wait while we fetch the list of exams." />
            ) : (
              <Select onValueChange={handleExamSelection}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-900 border dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select an exam..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border dark:border-gray-700">
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id} className="text-gray-900 dark:text-gray-100">
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add Questions</h1>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 dark:text-gray-100"
                onClick={() => {
                  setSelectedExam(null);
                  setQuestions([]);
                }}
              >
                Back to Exam Selection
              </Button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                <strong>Selected Exam:</strong> {selectedExam.title}
              </p>
            </div>

            {/* Question Form Here */}
            {/* You can include map of questions, input fields, option controls, etc. */}

            <div className="flex justify-between mt-6">
              <Button onClick={addQuestion} variant="outline">
                + Add Question
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700">
                Submit Questions ({questions.length})
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
