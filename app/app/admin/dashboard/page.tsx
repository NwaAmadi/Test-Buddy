import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Exam = {
  id: string;
  title: string;
  duration: number;
  date: string | null;
  time: string | null;
  status: string | null;
};

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    async function fetchExams() {
      const response = await fetch("/api/admin/exams", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data: Exam[] = await response.json();
      setExams(data);
    }
    fetchExams();
  }, [accessToken]);

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-lg text-gray-500">Welcome back, {user.first_name}</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{exam.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Duration: {exam.duration} minutes</p>
              <p className="text-xs text-gray-500">Date: {exam.date || "TBD"}</p>
              <p className="text-xs text-gray-500">Time: {exam.time || "TBD"}</p>
              <p className="text-xs text-gray-500">Status: {exam.status || "Pending"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}