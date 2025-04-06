"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileSpreadsheet, BarChart, PieChart } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock result data
const examData = {
  id: "1",
  title: "Advanced Mathematics Final Exam",
  date: "Apr 5, 2025",
  totalStudents: 45,
  passedStudents: 38,
  averageScore: 78.5,
  highestScore: 98,
  lowestScore: 45,
  students: [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      score: 92,
      status: "Passed",
      timeSpent: "1h 45m",
      submittedAt: "10:45 AM",
    },
    {
      id: 2,
      name: "Jamie Smith",
      email: "jamie@example.com",
      score: 85,
      status: "Passed",
      timeSpent: "1h 30m",
      submittedAt: "10:30 AM",
    },
    {
      id: 3,
      name: "Taylor Brown",
      email: "taylor@example.com",
      score: 78,
      status: "Passed",
      timeSpent: "1h 55m",
      submittedAt: "10:55 AM",
    },
    {
      id: 4,
      name: "Jordan Wilson",
      email: "jordan@example.com",
      score: 45,
      status: "Failed",
      timeSpent: "1h 20m",
      submittedAt: "10:20 AM",
    },
    {
      id: 5,
      name: "Casey Miller",
      email: "casey@example.com",
      score: 65,
      status: "Passed",
      timeSpent: "1h 40m",
      submittedAt: "10:40 AM",
    },
    // More students would be added here
  ],
}

export default function ExamResultsPage({ params }: { params: { id: string } }) {
  // Function to handle Excel export
  const handleExportExcel = () => {
    // In a real app, this would trigger an API call to generate and download an Excel file
    alert("In a real implementation, this would download an Excel file with all student results.")
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{examData.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">Results • {examData.date}</p>
          </div>

          <Button onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{examData.totalStudents}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Participated in exam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((examData.passedStudents / examData.totalStudents) * 100)}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {examData.passedStudents} of {examData.totalStudents} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{examData.averageScore}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Class average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {examData.lowestScore}% - {examData.highestScore}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Min - Max scores</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="students">Student Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
              <CardDescription>Detailed results for all students who took the exam</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.score}%</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "Passed" ? "success" : "destructive"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.timeSpent}</TableCell>
                      <TableCell>{student.submittedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/students/${student.id}/results/${params.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <Button onClick={handleExportExcel} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download All Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Score Distribution</CardTitle>
                  <BarChart className="h-4 w-4 text-gray-500" />
                </div>
                <CardDescription>Number of students in each score range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-500 dark:text-gray-400">Score distribution chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pass/Fail Ratio</CardTitle>
                  <PieChart className="h-4 w-4 text-gray-500" />
                </div>
                <CardDescription>Percentage of students who passed vs failed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-500 dark:text-gray-400">Pass/fail pie chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

