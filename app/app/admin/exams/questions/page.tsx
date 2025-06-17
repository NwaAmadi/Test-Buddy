"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  options: Option[];
  correct_answer: string | null; // Stores the ID of the correct option
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
            { id: "a", text: "" },
            { id: "b", text: "" },
            { id: "c", text: "" },
          ],
          correct_answer: null,
        },
      ]);
    } else {
      toast.error("Selected exam not found.");
    }
  };

  // Handle question field changes with defensive programming
  const handleQuestionChange = (index: number, key: keyof Question, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [key]: key === "text" ? (value || "") : value, // Ensure text is never null/undefined
    };
    setQuestions(updatedQuestions);
  };

  // Handle option field changes with defensive programming
  const handleOptionChange = (questionIndex: number, optionIndex: number, key: keyof Option, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = { 
      ...options[optionIndex], 
      [key]: value || "" // Ensure option values are never null/undefined
    };
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  // Add a new option
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options.push({ id: String.fromCharCode(97 + options.length), text: "" });
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    
    // Don't allow removing if only one option remains
    if (options.length <= 1) {
      toast.error("Each question must have at least one option.");
      return;
    }
    
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
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
        ],
        correct_answer: null,
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

  // Submit questions to the backend with improved validation
  const handleSubmit = async () => {
    if (!selectedExam) {
      toast.error("Please select an exam.");
      return;
    }

    // Improved validation - handle null/undefined values
    const invalidQuestions = questions.filter((q) => !q.text || !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast.error("All questions must have text.");
      return;
    }

    // Improved option validation
    const invalidOptions = questions.some((q) =>
      q.options.some((option) => !option.text || !option.text.trim())
    );
    if (invalidOptions) {
      toast.error("All options must have text.");
      return;
    }

    // Validate that a correct answer is selected for each question
    const missingCorrectAnswers = questions.some((q) => !q.correct_answer);
    if (missingCorrectAnswers) {
      toast.error("Each question must have a correct answer selected.");
      return;
    }

    // Validate that correct answers match existing option IDs
    const invalidCorrectAnswers = questions.some((q) => 
      !q.options.some(option => option.id === q.correct_answer)
    );
    if (invalidCorrectAnswers) {
      toast.error("Some questions have invalid correct answers selected.");
      return;
    }

    try {
      // Ensure all text fields are properly trimmed and not null
      const formattedQuestions = questions.map((q) => ({
        text: (q.text || "").trim(), // Ensure text is never null/undefined
        question_type: q.question_type,
        position: q.position,
        options: q.options.map(option => ({
          ...option,
          text: (option.text || "").trim() // Ensure option text is never null/undefined
        })),
        correct_answer: q.correct_answer,
      }));

      // Debug log to see what's being sent
      console.log("Formatted questions being sent:", formattedQuestions);

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
      console.error("Submit error:", err);
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Add Questions</h1>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedExam(null);
                setQuestions([]);
              }}
            >
              Back to Exam Selection
            </Button>
          </div>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Selected Exam:</strong> {selectedExam.title}
            </p>
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
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.text || ""} // Defensive programming
                      onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  <div>
                    <Label>Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-4 mb-2">
                        <Input
                          value={option.id || ""} // Defensive programming
                          onChange={(e) => handleOptionChange(index, optionIndex, "id", e.target.value)}
                          placeholder="Option ID (e.g., a, b, c)"
                          className="w-16"
                        />
                        <Input
                          value={option.text || ""} // Defensive programming
                          onChange={(e) => handleOptionChange(index, optionIndex, "text", e.target.value)}
                          placeholder="Option Text"
                          className="flex-1"
                        />
                        {question.options.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeOption(index, optionIndex)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOption(index)}>
                      + Add Option
                    </Button>
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <RadioGroup
                      value={question.correct_answer || ""}
                      onValueChange={(value) => handleQuestionChange(index, "correct_answer", value)}
                    >
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <RadioGroupItem value={option.id} id={`correct-${index}-${option.id}`} />
                          <Label htmlFor={`correct-${index}-${option.id}`}>
                            {option.text || `Option ${option.id}`}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={addQuestion}>
              + Add Question
            </Button>
            <Button onClick={handleSubmit}>
              Submit Questions ({questions.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}