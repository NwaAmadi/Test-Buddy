"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

export default function AddQuestionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [options, setOptions] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken") || ""
    const res = await fetch(`${BACKEND_URL}/api/admin/exams/${params.id}/questions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, options: JSON.parse(options), correctAnswer }),
    })

    if (res.ok) {
      router.push(`/admin/exams/${params.id}`)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Add Question</h1>
        <div className="space-y-4">
          <Textarea placeholder="Question Text" value={text} onChange={(e) => setText(e.target.value)} />
          <Textarea placeholder='Options (e.g., [{"id":"a","text":"Option A"},{"id":"b","text":"Option B"}])' value={options} onChange={(e) => setOptions(e.target.value)} />
          <Input placeholder="Correct Answer (e.g., a)" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} />
          <Button onClick={handleSubmit}>Add Question</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}