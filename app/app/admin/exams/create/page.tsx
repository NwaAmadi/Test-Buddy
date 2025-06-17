"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      setError("All fields are required.")
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
      const res = await fetch(`${BACKEND_URL}/api/admin/exams`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, date, time, duration: parsedDuration }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || "Failed to create exam.")
      }

      router.push("/admin/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input placeholder="e.g., Linear Algebra" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" min="0" placeholder="e.g., 120" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Exam"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
