"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Option = {
  id: string;
  text: string;
};

type Question = {
  text: string;
  question_type: string;
  position: number;
  options: string; // stored as string in form, parsed to Option[] before sending
};

export default function Page() {
  const [exams, setExams] = useState<{ id: string; name: string }[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "",
      question_type: "multiple_choice",
      position: 1,
      options: '[{"id":"a","text":""},{"id":"b","text":""},{"id":"c","text":""}]',
    },
  ]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams");
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      }
    };
    fetchExams();
  }, []);

  const handleQuestionChange = (
    index: number,
    key: keyof Question,
    value: string | number
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [key]: value,
    };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
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

  const handleSubmit = async () => {
    try {
      const formattedQuestions = questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options),
      }));

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: selectedExamId,
          questions: formattedQuestions,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to insert questions.");
      }

      toast.success("Questions inserted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to insert questions.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Questions</h1>

      <div className="mb-4">
        <Label>Select Exam</Label>
        <Select onValueChange={(value) => setSelectedExamId(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {questions.map((question, index) => (
        <div key={index} className="border p-4 mb-4 rounded-md shadow-sm">
          <Label className="block mb-2">Question Text</Label>
          <Textarea
            value={question.text}
            onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
            className="mb-4"
          />

          <Label className="block mb-2">Question Type</Label>
          <Select
            value={question.question_type}
            onValueChange={(value) => handleQuestionChange(index, "question_type", value)}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Choose question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True / False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>

          <Label className="block mb-2">Position</Label>
          <Input
            type="number"
            value={question.position}
            onChange={(e) => handleQuestionChange(index, "position", Number(e.target.value))}
            className="mb-4"
          />

          <Label className="block mb-2">Options (JSON format)</Label>
          <Textarea
            value={question.options}
            onChange={(e) => handleQuestionChange(index, "options", e.target.value)}
            placeholder='[{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}]'
            className="mb-4"
          />
        </div>
      ))}

      <Button onClick={addQuestion} className="mb-4">
        Add Another Question
      </Button>

      <Button onClick={handleSubmit} disabled={!selectedExamId}>
        Submit Questions
      </Button>
    </div>
  );
}
