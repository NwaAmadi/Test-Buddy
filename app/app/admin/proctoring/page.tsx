import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Video, Clock, Users, AlertTriangle, Eye } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for active exams
const activeExams = [
  {
    id: 1,
    title: "Biology Midterm",
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    duration: "2 hours",
    totalStudents: 38,
    activeStudents: 36,
    proctorType: "manual",
    flaggedIncidents: 3,
  },
  {
    id: 2,
    title: "English Literature",
    startTime: "10:30 AM",
    endTime: "12:00 PM",
    duration: "1.5 hours",
    totalStudents: 25,
    activeStudents: 23,
    proctorType: "automatic",
    flaggedIncidents: 1,
  },
  {
    id: 3,
    title: "Computer Science Fundamentals",
    startTime: "1:00 PM",
    endTime: "3:00 PM",
    duration: "2 hours",
    totalStudents: 32,
    activeStudents: 30,
    proctorType: "automatic",
    flaggedIncidents: 0,
  },
]

// Mock data for upcoming exams
const upcomingExams = [
  {
    id: 4,
    title: "Calculus Final",
    date: "Apr 7, 2025",
    startTime: "10:00 AM",
    duration: "3 hours",
    totalStudents: 45,
    proctorType: "manual",
  },
  {
    id: 5,
    title: "Physics Lab Exam",
    date: "Apr 8, 2025",
    startTime: "2:00 PM",
    duration: "1.5 hours",
    totalStudents: 28,
    proctorType: "automatic",
  },
]

export default function ProctoringPage() {
  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Exam Proctoring</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor and manage exam proctoring sessions</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">Active Exams</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-6">
            {activeExams.map((exam) => (
              <Card key={exam.id} className={exam.flaggedIncidents > 0 ? "border-amber-300 dark:border-amber-800" : ""}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      <CardDescription>
                        {exam.startTime} - {exam.endTime} • {exam.duration}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={exam.proctorType === "manual" ? "outline" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        <Video className="h-3 w-3" />
                        {exam.proctorType === "manual" ? "Manual Proctoring" : "Automatic Proctoring"}
                      </Badge>

                      {exam.flaggedIncidents > 0 && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {exam.flaggedIncidents} Incidents
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Students</p>
                          <p className="text-lg">
                            {exam.activeStudents}/{exam.totalStudents} active
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-lg">In Progress</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link href={`/admin/exams/${exam.id}/monitor`}>
                          <Eye className="mr-2 h-4 w-4" />
                          {exam.proctorType === "manual" ? "Live Monitor" : "View Status"}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {exam.proctorType === "manual" && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Active Students</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="relative">
                            <Avatar className="h-10 w-10 border-2 border-background">
                              <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt="Student" />
                              <AvatarFallback>S{i + 1}</AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                          </div>
                        ))}
                        {exam.activeStudents > 8 && (
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                            +{exam.activeStudents - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="grid gap-6">
            {upcomingExams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      <CardDescription>
                        {exam.date} at {exam.startTime} • {exam.duration}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={exam.proctorType === "manual" ? "outline" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      <Video className="h-3 w-3" />
                      {exam.proctorType === "manual" ? "Manual Proctoring" : "Automatic Proctoring"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Registered Students</p>
                          <p className="text-lg">{exam.totalStudents}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/exams/${exam.id}`}>View Details</Link>
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={`/admin/exams/${exam.id}/edit`}>Edit Proctoring Settings</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

