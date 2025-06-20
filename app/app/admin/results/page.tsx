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
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Exam Results</h1>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
            onChange={(e) => {
              const exam = exams.find(ex => ex.id === e.target.value)
              setSelectedExam(exam)
              fetchResults(e.target.value)
            }}
            value={selectedExam?.id || ""}
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          {selectedExam && results.length > 0 && (
            <Button onClick={downloadResults} className="ml-0 sm:ml-4">
              Download Results
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 mt-6">
            <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">Fetching results...</span>
          </div>
        )}

        {selectedExam && results.length > 0 && (
          <div className="overflow-x-auto mt-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full">
            <h2 className="text-xl font-semibold px-6 pt-6 pb-2 text-gray-800 dark:text-gray-200">
              <span className="text-blue-600 dark:text-white-400">{selectedExam.title}</span>
            </h2>
            <table className="w-full min-w-[700px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">First Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">Last Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">Score (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">Passed</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{r.first_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{r.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{r.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        r.passed
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {r.passed ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && selectedExam && results.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No results found for this exam.
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
