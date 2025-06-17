"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

export default function CreateExamPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken") || ""
    const res = await fetch(`${BACKEND_URL}/api/admin/exams`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, date, time, duration }),
    })

    if (res.ok) {
      router.push("/admin/dashboard")
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
        <div className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Date (YYYY-MM-DD)" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input placeholder="Time (HH:MM)" value={time} onChange={(e) => setTime(e.target.value)} />
          <Input placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Button onClick={handleSubmit}>Create Exam</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}