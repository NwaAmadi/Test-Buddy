import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

// Mock fetch function (replace with real API call)
async function fetchStudentDashboard() {
  // Replace with your API call, e.g. fetch('/api/student/dashboard')
  return {
    name: "Alex",
    upcomingExams: [
      {
        id: 1,
        title: "Advanced Mathematics",
        date: "Apr 5, 2025",
        time: "10:00 AM",
        duration: "2 hours",
        status: "Not Started",
      },
      // ...other exams
    ],
    recentResults: [
      {
        id: 4,
        title: "Chemistry Final",
        date: "Apr 1, 2025",
        score: "85%",
        status: "Passed",
      },
      // ...other results
    ],
    stats: {
      upcomingCount: 3,
      completedCount: 8,
      averageScore: "85%",
      courseProgress: 65,
      nextExamIn: "2 days",
    },
  }
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null)

  useEffect(() => {
    fetchStudentDashboard().then(setStudent)
  }, [])

  if (!student) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {student.name}! Here's an overview of your exams.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.stats.upcomingCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Next exam in {student.stats.nextExamIn}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.stats.completedCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Average score: {student.stats.averageScore}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.stats.courseProgress}%</div>
            <Progress value={student.stats.courseProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Your scheduled exams for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.upcomingExams.map((exam: any) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium">{exam.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{exam.date}</span>
                      <Clock className="h-3.5 w-3.5 ml-2" />
                      <span>{exam.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Duration: {exam.duration}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{exam.status}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/student/exams/${exam.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>Your most recent exam results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.recentResults.map((exam: any) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium">{exam.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exam.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-bold">{exam.score}</div>
                    <Badge variant={exam.status === "Passed" ? "default" : "destructive"}>
                      {exam.status}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/student/results/${exam.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}