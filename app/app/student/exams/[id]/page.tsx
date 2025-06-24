"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Clock } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { ModalWithJSX } from "@/components/ui/ModalWithJsx"
import { Checkbox } from "@/components/ui/checkbox"
import { startFaceMonitoring } from "@/utils/face-monitoring"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER
const userObject = localStorage.getItem("user")
const user = userObject ? JSON.parse(userObject) : null

const fetchExam = async (examId: string, accessToken: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/exam/${examId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    if (res.status === 403) {
      throw new Error("You have already submitted this exam.")
    }

    if (!res.ok) {
      throw new Error("Failed to fetch exam.")
    }

    return await res.json()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred."
    throw new Error(errorMessage)
  }
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
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [showRulesModal, setShowRulesModal] = useState(true)
  const [examStarted, setExamStarted] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleAnswerSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [exam.questions[currentQuestion].id]: value,
    }))
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (examSubmitted || !exam) return
    setExamSubmitted(true)

    try {
      const accessToken = localStorage.getItem("accessToken") || ""

      const allAnswers: Record<string, string> = {}
      exam.questions.forEach((q: any) => {
        allAnswers[q.id] = answers[q.id] || ""
      })

      const res = await fetch(`${BACKEND_URL}/api/exam-submission/${params.id}/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: allAnswers }),
      })

      if (!res.ok) throw new Error("Submission failed")

      await res.json()
      router.push(`/student/results/`)
    } catch (err) {
      setExamSubmitted(false)
      setError("Failed to submit exam. Please try again.")
    }
  }

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken") || ""
    fetchExam(params.id, accessToken)
      .then((data) => {
        setExam(data)
        setTimeLeft((parseInt(data.duration, 10) || 60) * 60)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!examStarted || !timeLeft || !exam) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current!)
  }, [timeLeft, examStarted, exam])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitched(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    const handlePopState = () => {
      handleSubmit()
      history.pushState(null, "", window.location.href)
    }

    history.pushState(null, "", window.location.href)
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [exam])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Modal title="Loading..." description="Please wait while the exam is being loaded." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="student">
        <Modal
          title="Error"
          description={error}
          onClose={() => router.push("/student/dashboard")}
        />
      </DashboardLayout>
    )
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
    return (
      <DashboardLayout role="student">
        <Modal
          title="Exam Not Found"
          description="This exam could not be found or has no questions."
          onClose={() => router.push("/student/dashboard")}
        />
      </DashboardLayout>
    )
  }

  if (showRulesModal) {
    return (
      <DashboardLayout role="student">
        <ModalWithJSX
          title="Exam Rules & Guidelines"
          description={
            <>
              <ul className="list-disc list-inside space-y-2">
                <li>Do not switch tabs during the exam. It will be logged.</li>
                <li>You must remain visible on camera throughout the exam.</li>
                <li>Do not close or refresh this page. Doing so will submit your exam automatically.</li>
                <li>The exam is timed and will auto-submit when time expires.</li>
                <li>Attempt all questions to the best of your ability and ensure you submit something.</li>
                <li>The system will submit with a <strong>zero-score</strong> if you didn't manually submit.</li>
              </ul>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="agree" checked={agreed} onCheckedChange={(val) => setAgreed(!!val)} />
                <Label htmlFor="agree">I have read and agree to the rules</Label>
              </div>
            </>
          }
          footer={
            <Button
              disabled={!agreed}
              onClick={async () => {
                setShowRulesModal(false)
                setExamStarted(true)

                try {
                  const video = document.createElement("video")
                  video.autoplay = true
                  video.muted = true
                  video.playsInline = true
                  video.style.display = "none"
                  document.body.appendChild(video)

                  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                  video.srcObject = stream

                  const studentId = user.id
                  const exam_id = exam.id

                  startFaceMonitoring(video, studentId, exam_id, (reason) => {
                    
                    stream.getTracks().forEach((track) => track.stop())

                    alert(`Exam ended!: ${reason}`)
                    router.push("/student/dashboard")
                  })
                } catch (err) {
                  toast.info("Camera access denied!")
                  router.push("/student/dashboard")
                }
              }}
            >
              Start Exam
            </Button>

          }
          onForceClose={() => {
            if (!agreed && !examStarted) router.push("/student/dashboard")
          }}
        />
      </DashboardLayout>
    )
  }

  const progress = (currentQuestion / exam.questions.length) * 100
  const question = exam.questions[currentQuestion]
  const options = typeof question.options === "string"
    ? JSON.parse(question.options)
    : question.options

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
            Tab switching detected. This incident has been logged.
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
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {options && options.length > 0 ? (
              options.map((option: any) => (
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
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0 || examSubmitted}>
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < exam.questions.length - 1 ? (
            <Button onClick={handleNext} disabled={examSubmitted}>Next</Button>
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
