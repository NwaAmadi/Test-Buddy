"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

export default function AddQuestionsPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([{ id: "", text: "" }]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      const accessToken = localStorage.getItem("accessToken") || "";
      const res = await fetch(`${BACKEND_URL}/api/admin/exams`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    };
    fetchExams();
  }, []);

  const handleAddOption = () => {
    setOptions([...options, { id: "", text: "" }]);
  };

  const handleOptionChange = (index: number, key: "id" | "text", value: string) => {
    const newOptions = [...options];
    newOptions[index][key] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!selectedExamId || !questionText || !correctAnswer || options.length < 2) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken") || "";
    const res = await fetch(`${BACKEND_URL}/api/admin/exams/${selectedExamId}/questions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: questionText,
        options,
        correctAnswer,
      }),
    });

    if (res.ok) {
      toast.success("Question added successfully!");
      setQuestionText("");
      setOptions([{ id: "", text: "" }]);
      setCorrectAnswer("");
    } else {
      toast.error("Failed to add question.");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <h1 className="text-3xl font-semibold">Add Question</h1>

        <div className="space-y-2">
          <Label>Select Exam</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title || exam.name || exam.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            placeholder="Enter your question here"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label>Options</Label>
          {options.map((option, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="ID (e.g. a, b, c)"
                value={option.id}
                onChange={(e) => handleOptionChange(idx, "id", e.target.value)}
              />
              <Input
                className="flex-1"
                placeholder="Option Text"
                value={option.text}
                onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
              />
            </div>
          ))}
          <Button variant="outline" onClick={handleAddOption}>
            Add Another Option
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Correct Answer ID</Label>
          <Input
            placeholder="e.g., a"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit Question
        </Button>
      </div>
    </DashboardLayout>
  );
}
