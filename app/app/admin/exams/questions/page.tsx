"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

type Option = {
  id: string;
  text: string;
};

type Question = {
  text: string;
  question_type: string;
  position: number;
  options: string;
};

export default function Page() {
  const [exams, setExams] = useState<{ id: string; name: string }[]>([]);
  const [selectedExam, setSelectedExam] = useState<{ id: string; name: string } | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  useEffect(() => {
    const fetchExams = async () => {
      if (!BACKEND_URL) {
        console.error("BACKEND_URL is not defined in environment variables.");
        toast.error("Server configuration error. Please contact support.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found in localStorage.");
        toast.error("Please log in to access exams.");
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
        console.log("Fetched exams:", data); // Debugging log

        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error("Expected an array of exams, but received invalid data.");
        }

        // Ensure data contains objects with id and name
        const validExams = data.filter(
          (exam: any) => typeof exam === "object" && exam.id && exam.name
        );

        if (validExams.length === 0) {
          toast.warning("No valid exams found.");
        }

        setExams(validExams);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        toast.error(err instanceof Error ? err.message : "Failed to load exams. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleExamSelection = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (exam) {
      setSelectedExam(exam);
      setQuestions([
        {
          text: "",
          question_type: "multiple_choice",
          position: 1,
          options: '[{"id":"a","text":""},{"id":"b","text":""},{"id":"c","text":""}]',
        },
      ]);
      setShowQuestionForm(true);
    } else {
      toast.error("Selected exam not found.");
    }
  };

  const handleQuestionChange = (index: number, key: keyof Question, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [key]: value,
    };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (questions.length >= 100) {
      toast.error("Maximum 100 questions allowed per exam.");
      return;
    }

    setQuestions([
      ...questions,
      {
        text: "",
        question_type: "multiple_choice",
        position: questions.length + 1,
        options: '[{"id":"a","text":""},{"id":"b","text":""},{"id":"c","text":""}]',
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
    if (!selectedExam) {
      toast.error("Please select an exam.");
      return;
    }

    const invalidQuestions = questions.filter((q) => !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast.error("All questions must have text.");
      return;
    }

    try {
      const formattedQuestions = questions.map((q) => {
        let parsedOptions;
        try {
          parsedOptions = JSON.parse(q.options);
        } catch (e) {
          throw new Error(`Invalid JSON format in options for question ${q.position}.`);
        }

        return {
          exam_id: selectedExam.id,
          text: q.text,
          question_type: q.question_type,
          position: q.position,
          options: JSON.stringify(parsedOptions),
        };
      });

      const res = await fetch(`${BACKEND_URL}/api/admin/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ questions: formattedQuestions }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit questions.");
      }

      toast.success(`${questions.length} questions added successfully!`);
      setShowQuestionForm(false);
      setSelectedExam(null);
      setQuestions([]);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to submit questions.");
    }
  };

  const goBack = () => {
    setShowQuestionForm(false);
    setSelectedExam(null);
    setQuestions([]);
  };

  if (!showQuestionForm) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Select Exam</h1>
        <div className="space-y-4">
          <Label className="text-lg">Choose an exam to add questions to:</Label>
          {isLoading ? (
            <p>Loading exams...</p>
          ) : exams.length === 0 ? (
            <p>No exams available. Please try again later.</p>
          ) : (
            <Select onValueChange={handleExamSelection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Add Questions</h1>
          <p className="text-gray-600 mt-2">
            Adding questions to: <span className="font-semibold">{selectedExam?.name}</span>
          </p>
          <p className="text-sm text-gray-500">{questions.length}/100 questions added</p>
        </div>
        <Button variant="outline" onClick={goBack}>
          ← Back to Exam Selection
        </Button>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Question {index + 1}</h3>
              {questions.length > 1 && (
                <Button variant="destructive" size="sm" onClick={() => removeQuestion(index)}>
                  Remove
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <Label className="block mb-2">Question Text</Label>
                <Textarea
                  value={question.text}
                  onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                  placeholder="Enter your question here..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block mb-2">Question Type</Label>
                  <Select
                    value={question.question_type}
                    onValueChange={(value) => handleQuestionChange(index, "question_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block mb-2">Position</Label>
                  <Input
                    type="number"
                    value={question.position}
                    onChange={(e) => handleQuestionChange(index, "position", Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label className="block mb-2">Options (JSON format)</Label>
                <Textarea
                  value={question.options}
                  onChange={(e) => handleQuestionChange(index, "options", e.target.value)}
                  placeholder='[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"},{"id":"c","text":"Option C"}]'
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: {'[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <Button onClick={addQuestion} variant="outline" disabled={questions.length >= 100}>
          + Add Another Question
        </Button>
        <Button onClick={handleSubmit} className="ml-auto" disabled={questions.length === 0}>
          Submit {questions.length} Question{questions.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}