"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Clock } from "lucide-react"

// Mock exam data
const examData = {
  id: "1",
  title: "Advanced Mathematics",
  description: "Final exam covering all topics from the semester",
  duration: 120, // in minutes
  totalQuestions: 10,
  questions: [
    {
      id: 1,
      text: "What is the derivative of f(x) = x²?",
      options: [
        { id: "a", text: "f'(x) = x" },
        { id: "b", text: "f'(x) = 2x" },
        { id: "c", text: "f'(x) = 2" },
        { id: "d", text: "f'(x) = x²" },
      ],
      correctAnswer: "b",
    },
    {
      id: 2,
      text: "Solve for x: 2x + 5 = 15",
      options: [
        { id: "a", text: "x = 5" },
        { id: "b", text: "x = 7.5" },
        { id: "c", text: "x = 10" },
        { id: "d", text: "x = 20" },
      ],
      correctAnswer: "a",
    },
    {
      id: 3,
      text: "What is the value of π (pi) to two decimal places?",
      options: [
        { id: "a", text: "3.12" },
        { id: "b", text: "3.14" },
        { id: "c", text: "3.16" },
        { id: "d", text: "3.18" },
      ],
      correctAnswer: "b",
    },
    {
      id: 4,
      text: "If a triangle has sides of length 3, 4, and 5, what type of triangle is it?",
      options: [
        { id: "a", text: "Equilateral" },
        { id: "b", text: "Isosceles" },
        { id: "c", text: "Scalene" },
        { id: "d", text: "Right-angled" },
      ],
      correctAnswer: "d",
    },
    {
      id: 5,
      text: "What is the sum of the interior angles of a pentagon?",
      options: [
        { id: "a", text: "360°" },
        { id: "b", text: "450°" },
        { id: "c", text: "540°" },
        { id: "d", text: "720°" },
      ],
      correctAnswer: "c",
    },
    // More questions would be added here
  ],
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(examData.duration * 60) // in seconds
  const [tabSwitched, setTabSwitched] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitched(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || examSubmitted) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, examSubmitted])

  // Calculate progress
  const progress = (currentQuestion / examData.questions.length) * 100

  // Handle answer selection
  const handleAnswerSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [examData.questions[currentQuestion].id]: value,
    }))
  }

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  // Submit exam
  const handleSubmit = () => {
    setExamSubmitted(true)
    // In a real app, you would send the answers to the server here
    // For demo purposes, we'll just redirect to the results page
    setTimeout(() => {
      router.push(`/student/results/${params.id}`)
    }, 1500)
  }

  // Current question data
  const question = examData.questions[currentQuestion]

  return (
    <DashboardLayout role="student">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{examData.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{examData.description}</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md">
          <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {tabSwitched && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            Tab switching detected. This incident has been logged. Multiple violations may result in exam termination.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestion + 1} of {examData.questions.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">
            Question {currentQuestion + 1}: {question.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[question.id] || ""} onValueChange={handleAnswerSelect} className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleAnswerSelect(option.id)}
              >
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < examData.questions.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={examSubmitted}>
              {examSubmitted ? "Submitting..." : "Submit Exam"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

