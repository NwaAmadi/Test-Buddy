"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

export default function CreateExamPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    if (!title || !date || !time || !duration) {
      toast.info("All fields are required.")
      return
    }

    const parsedDuration = parseInt(duration)
    if (isNaN(parsedDuration)) {
      setError("Duration must be a valid number.")
      return
    }

    setLoading(true)
    const accessToken = localStorage.getItem("accessToken") || ""

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/exam`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, date, time, duration: parsedDuration }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        toast.info(error || "Failed to create exam")
      }
      toast.success("Exam created successfully")
      router.push("/admin/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">Create Exam</h1>
        <div className="space-y-6">
          <div>
            <Label className="text-lg text-gray-800 dark:text-gray-200">Title</Label>
            <Input
              className="mt-2 h-14 text-lg px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 w-full"
              placeholder="e.g., Linear Algebra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Label className="text-lg text-gray-800 dark:text-gray-200">Date</Label>
              <Input
                type="date"
                className="mt-2 h-14 text-lg px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label className="text-lg text-gray-800 dark:text-gray-200">Time</Label>
              <Input
                type="time"
                className="mt-2 h-14 text-lg px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 w-full"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-lg text-gray-800 dark:text-gray-200">Duration (minutes)</Label>
            <Input
              type="number"
              min="0"
              className="mt-2 h-14 text-lg px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 w-full"
              placeholder="e.g., 120"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`
              w-full h-14 text-lg
              bg-black hover:bg-gray-900 text-white
              dark:bg-white dark:hover:bg-gray-200 dark:text-black
              transition-colors
            `}
          >
            {loading ? "Creating..." : "Create Exam"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}