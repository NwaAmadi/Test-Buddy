import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Exam = {
  id: string;
  title: string;
  duration: number;
  date: string | null;
  time: string | null;
};

export default function UpdateExamPage() {
  const router = useRouter();
  const { id } = router.query;
  const [exam, setExam] = useState<Exam | null>(null);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    async function fetchExam() {
      const response = await fetch(`/api/admin/exams/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data: Exam = await response.json();
      setExam(data);
    }
    if (id) fetchExam();
  }, [id, accessToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/exams/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(exam),
    });
    router.push("/admin/dashboard");
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Update Exam</h1>
      </div>
      {exam && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              value={exam.duration || ""}
              onChange={(e) => setExam({ ...exam, duration: Number(e.target.value) })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={exam.date || ""}
              onChange={(e) => setExam({ ...exam, date: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={exam.time || ""}
              onChange={(e) => setExam({ ...exam, time: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <Button type="submit">Update Exam</Button>
        </form>
      )}
    </DashboardLayout>
  );
}