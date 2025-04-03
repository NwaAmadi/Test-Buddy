import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock result data
const resultData = {
  id: "1",
  examTitle: "Advanced Mathematics",
  date: "Apr 5, 2025",
  score: 80,
  totalQuestions: 10,
  correctAnswers: 8,
  incorrectAnswers: 2,
  timeSpent: "1h 45m",
  status: "Passed",
  questions: [
    {
      id: 1,
      text: "What is the derivative of f(x) = x²?",
      userAnswer: "b",
      correctAnswer: "b",
      isCorrect: true,
      explanation: "The derivative of x² is 2x.",
    },
    {
      id: 2,
      text: "Solve for x: 2x + 5 = 15",
      userAnswer: "a",
      correctAnswer: "a",
      isCorrect: true,
      explanation: "2x + 5 = 15 → 2x = 10 → x = 5",
    },
    {
      id: 3,
      text: "What is the value of π (pi) to two decimal places?",
      userAnswer: "b",
      correctAnswer: "b",
      isCorrect: true,
      explanation: "π ≈ 3.14159... which rounds to 3.14",
    },
    {
      id: 4,
      text: "If a triangle has sides of length 3, 4, and 5, what type of triangle is it?",
      userAnswer: "d",
      correctAnswer: "d",
      isCorrect: true,
      explanation: "A triangle with sides 3, 4, and 5 is a right-angled triangle (Pythagorean triple).",
    },
    {
      id: 5,
      text: "What is the sum of the interior angles of a pentagon?",
      userAnswer: "b",
      correctAnswer: "c",
      isCorrect: false,
      explanation:
        "The sum of interior angles of a polygon with n sides is (n-2) × 180°. For a pentagon (n=5), it's (5-2) × 180° = 540°.",
    },
    // More questions would be added here
  ],
}

export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <h1 className="text-3xl font-bold">{resultData.examTitle} Results</h1>
        <p className="text-gray-500 dark:text-gray-400">Exam completed on {resultData.date}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resultData.score}%</div>
            <Badge className="mt-2" variant={resultData.status === "Passed" ? "success" : "destructive"}>
              {resultData.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {resultData.correctAnswers}/{resultData.totalQuestions}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Correct answers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resultData.timeSpent}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Out of 2 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((resultData.correctAnswers / resultData.totalQuestions) * 100).toFixed(0)}%
            </div>
            <Progress value={(resultData.correctAnswers / resultData.totalQuestions) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review your answers and see explanations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resultData.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <div className="flex items-start gap-3">
                  {question.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">
                      Question {index + 1}: {question.text}
                    </h3>

                    <div className="mt-2 grid gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Your answer:</span>
                        <Badge variant={question.isCorrect ? "outline" : "destructive"}>
                          Option {question.userAnswer.toUpperCase()}
                        </Badge>
                      </div>

                      {!question.isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Correct answer:</span>
                          <Badge variant="outline">Option {question.correctAnswer.toUpperCase()}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Explanation:</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

