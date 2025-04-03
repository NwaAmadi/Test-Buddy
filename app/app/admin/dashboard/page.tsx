import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Users, Clock, AlertTriangle, Plus } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/exams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+15 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next exam in 2 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Flagged Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Requires review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="active">Active Now</TabsTrigger>
          <TabsTrigger value="recent">Recent Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
              <CardDescription>Exams scheduled for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: "Advanced Mathematics",
                    date: "Apr 5, 2025",
                    time: "10:00 AM",
                    duration: "2 hours",
                    students: 45,
                  },
                  {
                    id: 2,
                    title: "Computer Science Fundamentals",
                    date: "Apr 7, 2025",
                    time: "2:00 PM",
                    duration: "1.5 hours",
                    students: 32,
                  },
                  {
                    id: 3,
                    title: "Introduction to Physics",
                    date: "Apr 8, 2025",
                    time: "9:00 AM",
                    duration: "3 hours",
                    students: 28,
                  },
                ].map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <h3 className="font-medium">{exam.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.date} at {exam.time} • {exam.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{exam.students} students</div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/exams/${exam.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Exams</CardTitle>
              <CardDescription>Exams currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 4,
                    title: "Biology Midterm",
                    startTime: "9:00 AM",
                    endTime: "11:00 AM",
                    students: 38,
                    active: 36,
                  },
                  {
                    id: 5,
                    title: "English Literature",
                    startTime: "10:30 AM",
                    endTime: "12:00 PM",
                    students: 25,
                    active: 23,
                  },
                ].map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <h3 className="font-medium">{exam.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.startTime} - {exam.endTime} • {exam.active}/{exam.students} active
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/exams/${exam.id}/monitor`}>Monitor</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Exam results from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 6,
                    title: "Chemistry Final",
                    date: "Apr 1, 2025",
                    avgScore: "78%",
                    students: 42,
                    passed: 38,
                  },
                  {
                    id: 7,
                    title: "History Midterm",
                    date: "Mar 30, 2025",
                    avgScore: "82%",
                    students: 35,
                    passed: 33,
                  },
                  {
                    id: 8,
                    title: "Calculus Quiz",
                    date: "Mar 28, 2025",
                    avgScore: "75%",
                    students: 28,
                    passed: 24,
                  },
                ].map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <h3 className="font-medium">{exam.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.date} • Avg: {exam.avgScore} • {exam.passed}/{exam.students} passed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/exams/${exam.id}/results`}>View Results</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

