"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { LoadingPopup } from "@/components/ui/loading-popup"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

async function fetchStudentDashboard() {
  let accessToken = ""
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken") || ""
  }

  const res = await fetch(`${BACKEND_URL}/api/student/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data")
  }
  return res.json()
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null)
  const [studentName, setStudentName] = useState<string>("")

  useEffect(() => {
    let name = ""
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          name = user.first_name
        } catch {
          name = ""
        }
      }
    }
    setStudentName(name)

    fetchStudentDashboard().then(setStudent)
  }, [])

  if (!student) {
    return <LoadingPopup message="Please wait..." />
  }

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {studentName}!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Exams</CardTitle>
          <CardDescription>
            {student.availableExams.length > 0
              ? "You have the following exams available:"
              : "No current exams at the moment."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.availableExams.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No current exams at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {student.availableExams.map((exam: any) => (
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
                      <Link href={`/student/exams/${exam.id}`}>Start Exam</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}