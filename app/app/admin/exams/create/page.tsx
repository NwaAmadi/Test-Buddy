"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, ArrowLeft, Save, Video, Shield } from "lucide-react"
import Link from "next/link"

export default function CreateExamPage() {
  const router = useRouter()
  const [examTitle, setExamTitle] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [examDuration, setExamDuration] = useState("60")
  const [passingScore, setPassingScore] = useState("60")
  const [proctorType, setProctorType] = useState("automatic")
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "",
    },
  ])

  // Add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        text: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctAnswer: "",
      },
    ])
  }

  // Remove a question
  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  // Update question text
  const updateQuestionText = (id: number, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  // Update option text
  const updateOptionText = (questionId: number, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
            }
          : q,
      ),
    )
  }

  // Update correct answer
  const updateCorrectAnswer = (questionId: number, correctAnswer: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, correctAnswer } : q)))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would send the exam data to the server here
    console.log({
      title: examTitle,
      description: examDescription,
      duration: examDuration,
      passingScore,
      proctorType,
      questions,
    })

    // Redirect to exams page
    router.push("/admin/exams")
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
        </Button>

        <h1 className="text-3xl font-bold">Create New Exam</h1>
        <p className="text-gray-500 dark:text-gray-400">Set up a new exam with questions and proctoring options</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Exam Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="proctoring">Proctoring</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
                <CardDescription>Set the basic details for your exam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced Mathematics Final Exam"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief description of the exam"
                    value={examDescription}
                    onChange={(e) => setExamDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select value={examDuration} onValueChange={setExamDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                    <Select value={passingScore} onValueChange={setPassingScore}>
                      <SelectTrigger id="passing-score">
                        <SelectValue placeholder="Select passing score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="60">60%</SelectItem>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.push("/admin/exams")}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => document.querySelector('[data-value="questions"]')?.click()}>
                  Next: Add Questions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>Question {index + 1}</CardTitle>
                      <CardDescription>Add your question and answer options</CardDescription>
                    </div>
                    {questions.length > 1 && (
                      <Button variant="outline" size="icon" onClick={() => removeQuestion(question.id)} type="button">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove question</span>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}`}>Question</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        placeholder="Enter your question here"
                        value={question.text}
                        onChange={(e) => updateQuestionText(question.id, e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Answer Options</Label>
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                            {option.id.toUpperCase()}
                          </div>
                          <Input
                            placeholder={`Option ${option.id.toUpperCase()}`}
                            value={option.text}
                            onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`correct-answer-${question.id}`}>Correct Answer</Label>
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(value) => updateCorrectAnswer(question.id, value)}
                      >
                        <SelectTrigger id={`correct-answer-${question.id}`}>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">Option A</SelectItem>
                          <SelectItem value="b">Option B</SelectItem>
                          <SelectItem value="c">Option C</SelectItem>
                          <SelectItem value="d">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Question
              </Button>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="details"]')?.click()}
                >
                  Back to Details
                </Button>
                <Button type="button" onClick={() => document.querySelector('[data-value="proctoring"]')?.click()}>
                  Next: Proctoring Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proctoring">
            <Card>
              <CardHeader>
                <CardTitle>Proctoring Settings</CardTitle>
                <CardDescription>Configure how students will be monitored during the exam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="proctor-type">Proctoring Type</Label>
                    <Select value={proctorType} onValueChange={setProctorType}>
                      <SelectTrigger id="proctor-type">
                        <SelectValue placeholder="Select proctoring type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic Proctoring</SelectItem>
                        <SelectItem value="manual">Manual Proctoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {proctorType === "automatic" ? (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">Automatic Proctoring</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">The system will automatically monitor students using:</p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="webcam-monitoring">Webcam Monitoring</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Detects additional persons)
                              </div>
                            </div>
                            <Switch id="webcam-monitoring" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="tab-switching">Tab Switching Detection</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Flags when student leaves exam page)
                              </div>
                            </div>
                            <Switch id="tab-switching" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="screen-recording">Screen Recording</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Records student's screen during exam)
                              </div>
                            </div>
                            <Switch id="screen-recording" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="browser-lock">Browser Lockdown</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Prevents opening other applications)
                              </div>
                            </div>
                            <Switch id="browser-lock" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">Manual Proctoring</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">You will monitor students in real-time through:</p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="live-video">Live Video Feed</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (View all students simultaneously)
                              </div>
                            </div>
                            <Switch id="live-video" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="chat-support">Live Chat Support</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Communicate with students during exam)
                              </div>
                            </div>
                            <Switch id="chat-support" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="flag-suspicious">Flag Suspicious Activity</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">(Mark students for review)</div>
                            </div>
                            <Switch id="flag-suspicious" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="recording">Record Session</Label>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Save video for later review)
                              </div>
                            </div>
                            <Switch id="recording" defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="questions"]')?.click()}
                >
                  Back to Questions
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Exam
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </DashboardLayout>
  )
}

