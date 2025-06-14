"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

async function fetchResult(resultId: string, accessToken: string) {
  const res = await fetch(`${BACKEND_URL}/api/result/${resultId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) throw new Error("Failed to fetch result")
  return res.json()
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken") || ""
    fetchResult(params.id, accessToken)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div>Loading...</div>
  if (!result) return <div>Result not found.</div>

  return (
    <DashboardLayout role="student">
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="text-xl font-bold">{result.examTitle}</h2>
            <p className="text-gray-500">Score: <Badge>{result.score} / {result.total}</Badge></p>
            <p className="text-gray-500">Status: <Badge variant={result.passed ? "default" : "destructive"}>{result.passed ? "Passed" : "Failed"}</Badge></p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Your Answers:</h3>
            <ul className="space-y-2">
              {result.answers && result.answers.map((ans: any, idx: number) => (
                <li key={ans.questionId} className="border rounded p-2">
                  <div className="font-medium">Q{idx + 1}: {ans.question}</div>
                  <div>Your answer: <Badge>{ans.selectedOption}</Badge></div>
                  <div>Correct answer: <Badge variant={ans.isCorrect ? "default" : "destructive"}>{ans.correctOption}</Badge></div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}