"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Clock, Eye, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data for exam monitoring
const examData = {
  id: "4",
  title: "Biology Midterm",
  startTime: "9:00 AM",
  endTime: "11:00 AM",
  duration: 120, // minutes
  totalStudents: 38,
  activeStudents: 36,
  timeElapsed: 45, // minutes
  students: [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      progress: 65, // percentage of questions answered
      status: "active",
      timeActive: "00:45:12",
      flagged: false,
    },
    {
      id: 2,
      name: "Jamie Smith",
      email: "jamie@example.com",
      progress: 80,
      status: "active",
      timeActive: "00:44:30",
      flagged: false,
    },
    {
      id: 3,
      name: "Taylor Brown",
      email: "taylor@example.com",
      progress: 45,
      status: "active",
      timeActive: "00:43:15",
      flagged: true,
      flagReason: "Multiple tab switches detected",
    },
    {
      id: 4,
      name: "Jordan Wilson",
      email: "jordan@example.com",
      progress: 90,
      status: "active",
      timeActive: "00:45:00",
      flagged: false,
    },
    {
      id: 5,
      name: "Casey Miller",
      email: "casey@example.com",
      progress: 30,
      status: "inactive",
      timeActive: "00:15:45",
      flagged: true,
      flagReason: "Disconnected for more than 5 minutes",
    },
    // More students would be added here
  ],
}

export default function ExamMonitorPage({ params }: { params: { id: string } }) {
  const [timeRemaining, setTimeRemaining] = useState(examData.duration - examData.timeElapsed)

  // Format time as HH:MM:SS
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`
  }

  // Update time remaining every minute
  useEffect(() => {
    if (timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1))
    }, 60000) // update every minute

    return () => clearInterval(timer)
  }, [timeRemaining])

  // Calculate progress percentage
  const progressPercentage = (examData.timeElapsed / examData.duration) * 100

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{examData.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Live Monitoring • {examData.startTime} - {examData.endTime}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Time Remaining</p>
                  <p className="text-xl font-bold">{formatTime(timeRemaining)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Active Students</p>
                  <p className="text-xl font-bold">
                    {examData.activeStudents}/{examData.totalStudents}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Exam Progress</span>
            <span className="text-sm font-medium">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Students ({examData.students.length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({examData.students.filter((s) => s.flagged).length})</TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({examData.students.filter((s) => s.status === "inactive").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4">
            {examData.students.map((student) => (
              <Card key={student.id} className={student.flagged ? "border-red-300 dark:border-red-800" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={student.name} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="h-2 w-24" />
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Time Active</span>
                        <span className="text-sm">{student.timeActive}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={student.status === "active" ? "success" : "secondary"}>
                          {student.status === "active" ? "Online" : "Offline"}
                        </Badge>

                        {student.flagged && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Flagged
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>

                  {student.flagged && (
                    <div className="mt-3 bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Warning:</span> {student.flagReason}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagged">
          <div className="grid gap-4">
            {examData.students
              .filter((s) => s.flagged)
              .map((student) => (
                <Card key={student.id} className="border-red-300 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="h-2 w-24" />
                            <span className="text-sm">{student.progress}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Time Active</span>
                          <span className="text-sm">{student.timeActive}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={student.status === "active" ? "success" : "secondary"}>
                            {student.status === "active" ? "Online" : "Offline"}
                          </Badge>

                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Flagged
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Warning:</span> {student.flagReason}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="grid gap-4">
            {examData.students
              .filter((s) => s.status === "inactive")
              .map((student) => (
                <Card key={student.id} className={student.flagged ? "border-red-300 dark:border-red-800" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="h-2 w-24" />
                            <span className="text-sm">{student.progress}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Time Active</span>
                          <span className="text-sm">{student.timeActive}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Offline</Badge>

                          {student.flagged && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Flagged
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>

                    {student.flagged && (
                      <div className="mt-3 bg-red-50 dark:bg-red-950/30 p-3 rounded-md text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Warning:</span> {student.flagReason}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

// Users component for the icon
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

