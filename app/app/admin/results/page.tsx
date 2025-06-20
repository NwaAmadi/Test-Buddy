"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { saveAs } from "file-saver";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

export default function ExamResultsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchExams = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/exam`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setExams(data);
      } catch (err) {
        toast.error("Failed to fetch exams");
      }
    };

    fetchExams();
  }, []);

  const fetchResults = async (examId: string) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/results/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        toast.error(data.error || "Failed to fetch results");
        setResults([]);
      }
    } catch (err) {
      toast.error("Error fetching results");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["First Name,Last Name,Email,Score,Passed"]
        .concat(results.map(r => `${r.first_name},${r.last_name},${r.email},${r.score},${r.passed}`))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, "exam_results.csv");
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Select Exam</Label>
            <Select onValueChange={(id) => {
              setSelectedExamId(id);
              fetchResults(id);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExamId && results.length > 0 && (
            <div className="flex items-end">
              <Button onClick={downloadResults} className="w-full">
                Download CSV
              </Button>
            </div>
          )}
        </div>

        {selectedExamId && (
          <>
            <h2 className="text-xl font-semibold mt-6">
              Results for <span className="text-blue-500">{selectedExam?.title}</span>
            </h2>

            {loading ? (
              <div className="grid gap-2 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-md w-full" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto mt-4">
                <table className="w-full border text-sm dark:border-neutral-700">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Score (%)</th>
                      <th className="p-3 text-left">Passed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={idx} className="border-t dark:border-neutral-800 hover:bg-muted/50">
                        <td className="p-3">{r.first_name} {r.last_name}</td>
                        <td className="p-3">{r.email}</td>
                        <td className="p-3">{r.score}</td>
                        <td className="p-3">
                          <span className={`font-medium ${r.passed ? "text-green-500" : "text-red-500"}`}>
                            {r.passed ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !loading && (
                <Card className="mt-6">
                  <CardContent className="py-6 text-center text-muted-foreground">
                    No results found for this exam.
                  </CardContent>
                </Card>
              )
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
