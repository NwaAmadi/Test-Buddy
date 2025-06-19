"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

interface Exam {
  id: string
  title: string
  date: string
  time: string
  duration: number
}

export default function AdminDashboard() {
  const [userName, setUserName] = useState("")
  const [exams, setExams] = useState<Exam[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const router = useRouter()

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      toast.error("UNAUTHORIZED!")
      router.push("/login")
      return
    }

    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.first_name || "Admin")
      } catch (error) {
        console.error("Invalid user object in localStorage")
      }
    }

    fetchExams(accessToken)
  }, [])

  const fetchExams = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/exam`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setExams(data)
      } else {
        toast.error("Failed to fetch exams")
      }
    } catch (error) {
      toast.error("Error fetching exams")
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!selectedExam) return
    const token = localStorage.getItem("accessToken") || ""
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/exam/${selectedExam.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        setExams((prev) => prev.filter((exam) => exam.id !== selectedExam.id))
        setOpenDialog(false)
        toast.success("Exam deleted")
      } else {
        toast.error("Failed to delete exam")
      }
    } catch (error) {
      toast.error("Error deleting exam")
      console.error(error)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {userName}!</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/create">
            <span>Create Exam</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <h3 className="font-medium">{exam.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {exam.date} at {exam.time} • {exam.duration} minutes
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedExam(exam)
                    setOpenDialog(true)
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="backdrop-blur">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </DialogHeader>
          <p>This action cannot be undone. This will permanently delete the exam.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
