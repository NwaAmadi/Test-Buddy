"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingPopup } from "@/components/ui/loading-popup"
import { Modal } from "@/components/ui/Modal"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

async function fetchResults(userId: string, accessToken: string) {
  const res = await fetch(`${BACKEND_URL}/student/results`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken") || "";
    const userId = localStorage.getItem("userId") || "";
    fetchResults(userId, accessToken)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPopup message="Fetching your results..." />;
  if (!results || results.length === 0) return <Modal title="Oops...!" description="No results found, contact the admin" />;

  return (
    <DashboardLayout role="student">
      <Card>
        <CardHeader>
          <CardTitle>All Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="border rounded p-4">
                <h2 className="text-xl font-bold">{result.examTitle}</h2>
                <p className="text-gray-500">Score: <Badge>{((result.score / result.total) * 100).toFixed(2)}%</Badge></p>
                <p className="text-gray-500">Status: <Badge variant={result.passed ? "default" : "destructive"}>{result.passed ? "Passed" : "Failed"}</Badge></p>
                <div>
                  <h3 className="font-semibold mt-2">Your Answers:</h3>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}