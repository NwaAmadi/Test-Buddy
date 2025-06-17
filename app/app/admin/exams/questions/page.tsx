"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

type Option = {
  id: string;
  text: string;
  correct?: boolean;
};

type Question = {
  text: string;
  question_type: string;
  position: number;
  options: Option[];
};

type Exam = {
  id: string;
  title: string;
};

export default function QuestionsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exams on component mount
  useEffect(() => {
    const fetchExams = async () => {
      if (!BACKEND_URL) {
        toast.error("Server configuration error. Please contact support.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
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
        setExams(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load exams.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Handle exam selection
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
            { id: "a", text: "", correct: false },
            { id: "b", text: "", correct: false },
            { id: "c", text: "", correct: false },
          ],
        },
      ]);
    } else {
      toast.error("Selected exam not found.");
    }
  };

  // Handle question field changes
  const handleQuestionChange = (index: number, key: keyof Question, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [key]: value,
    };
    setQuestions(updatedQuestions);
  };

  // Handle option field changes
  const handleOptionChange = (questionIndex: number, optionIndex: number, key: keyof Option, value: string | boolean) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = { ...options[optionIndex], [key]: value };
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  // Add a new option
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options.push({ id: String.fromCharCode(97 + options.length), text: "", correct: false });
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options.splice(optionIndex, 1);
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  // Add a new question
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
        options: [
          { id: "a", text: "", correct: false },
          { id: "b", text: "", correct: false },
          { id: "c", text: "", correct: false },
        ],
      },
    ]);
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      position: i + 1,
    }));
    setQuestions(reorderedQuestions);
  };

  // Submit questions to the backend
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
      const formattedQuestions = questions.map((q) => ({
        text: q.text,
        question_type: q.question_type,
        position: q.position,
        options: q.options,
        correct_answer: q.options.find((o) => o.correct)?.id || null,
      }));

      const res = await fetch(`${BACKEND_URL}/api/admin/questions/${selectedExam.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formattedQuestions),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit questions.");
      }

      toast.success(`${questions.length} question${questions.length !== 1 ? "s" : ""} added successfully!`);
      setSelectedExam(null);
      setQuestions([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit questions.");
    }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!selectedExam ? (
        <div>
          <h1 className="text-3xl font-bold mb-6">Select Exam</h1>
          {isLoading ? (
            <p>Loading exams...</p>
          ) : (
            <Select onValueChange={handleExamSelection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6">Add Questions</h1>
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
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  <div>
                    <Label>Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-4 mb-2">
                        <Input
                          value={option.id}
                          onChange={(e) => handleOptionChange(index, optionIndex, "id", e.target.value)}
                          placeholder="Option ID (e.g., a, b, c)"
                          className="w-16"
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, optionIndex, "text", e.target.value)}
                          placeholder="Option Text"
                          className="flex-1"
                        />
                        <Checkbox
                          checked={option.correct || false}
                          onCheckedChange={(checked) =>
                            handleOptionChange(index, optionIndex, "correct", checked as boolean)
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOption(index, optionIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOption(index)}>
                      + Add Option
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={addQuestion}>
              + Add Question
            </Button>
            <Button onClick={handleSubmit}>Submit Questions</Button>
          </div>
        </div>
      )}
    </div>
  );
}