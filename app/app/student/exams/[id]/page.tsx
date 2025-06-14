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

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

async function fetchExam(examId: string, accessToken: string) {
  const res = await fetch(`${BACKEND_URL}/api/exam/${examId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) throw new Error("Failed to fetch exam")
  return res.json()
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [tabSwitched, setTabSwitched] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleSubmit = async () => {
    setExamSubmitted(true)
    const accessToken = localStorage.getItem("accessToken") || ""
    const res = await fetch(`${BACKEND_URL}/api/exam/${params.id}/submit`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    router.push(`/student/results/${data.resultId}`)
  }

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleAnswerSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [exam.questions[currentQuestion].id]: value,
    }))
  }


  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken") || ""
    fetchExam(params.id, accessToken)
      .then((data) => {
        setExam(data)
        setTimeLeft((parseInt(data.duration, 10) || 60) * 60)
      })
      .catch(() => setExam(null))
      .finally(() => setLoading(false))
  }, [params.id])


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
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || examSubmitted) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, examSubmitted])

  if (loading) return <div>Loading...</div>
  if (!exam) return <div>Exam not found.</div>
  if (!exam.questions || exam.questions.length === 0) return <div>No questions for this exam.</div>

  // Calculate progress
  const progress = (currentQuestion / exam.questions.length) * 100

  // Current question data
  const question = exam.questions[currentQuestion]

  return (
    <DashboardLayout role="student">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{exam.description || ""}</p>
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
            Question {currentQuestion + 1} of {exam.questions.length}
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
            {question.options && question.options.length > 0 ? (
              question.options.map((option: any) => (
                <div
                  key={option.id || option}
                  className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleAnswerSelect(option.id || option)}
                >
                  <RadioGroupItem value={option.id || option} id={`option-${option.id || option}`} />
                  <Label htmlFor={`option-${option.id || option}`} className="flex-1 cursor-pointer">
                    {option.text || option}
                  </Label>
                </div>
              ))
            ) : (
              <div>No options for this question.</div>
            )}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < exam.questions.length - 1 ? (
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