"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { saveAs } from "file-saver"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER
const router = useRouter()

export default function ExamResultsPage({ params }: { params: { id: string } }) {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        toast.error("UNAUTHORIZED!")
        router.push("/login")
        return
      }

      const res = await fetch(`${BACKEND_URL}/api/admin/exams/${params.id}/results`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    }

    fetchResults()
  }, [params.id])

  const downloadResults = () => {
    const csvContent = "data:text/csv;charset=utf-8," + results.map(r => `${r.first_name},${r.last_name},${r.score}`).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    saveAs(blob, "results.csv")
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Exam Results</h1>
        <Button onClick={downloadResults}>Download Results</Button>
        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.id} className="border p-4 rounded">
              <p>{result.first_name} {result.last_name}</p>
              <p>Score: {result.score}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}