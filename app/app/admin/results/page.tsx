"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { saveAs } from "file-saver"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

export default function ExamResultsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    const fetchExams = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/exam`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch exams")
        const data = await res.json()
        setExams(data)
      } catch (err) {
        toast.error("Error fetching exams")
        console.error(err)
      }
    }

    fetchExams()
  }, [])

  const fetchResults = async (examId: string) => {
    setLoading(true)
    setResults([])
    const token = localStorage.getItem("accessToken")
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch results")
      const data = await res.json()
      setResults(data)
    } catch (err) {
      toast.error("Error fetching results")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadResults = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["First Name,Last Name,Score %,Passed"]
        .concat(results.map(r => `${r.first_name},${r.last_name},${r.score},${r.passed}`))
        .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    saveAs(blob, `results_${selectedExam?.title || "exam"}.csv`)
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Exam Results</h1>

        <select
          className="border rounded p-2"
          onChange={(e) => {
            const exam = exams.find(ex => ex.id === e.target.value)
            setSelectedExam(exam)
            fetchResults(e.target.value)
          }}
        >
          <option value="">Select Exam</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>

        {loading && <p>Fetching results...</p>}

        {selectedExam && results.length > 0 && (
          <>
            <h2 className="text-xl font-semibold">
              Results for {selectedExam.title}
            </h2>
            <Button onClick={downloadResults}>Download Results</Button>

            <table className="w-full mt-4 border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">First Name</th>
                  <th className="border p-2">Last Name</th>
                  <th className="border p-2">Score (%)</th>
                  <th className="border p-2">Passed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="border p-2">{r.first_name}</td>
                    <td className="border p-2">{r.last_name}</td>
                    <td className="border p-2">{r.score}</td>
                    <td className="border p-2">{r.passed ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
