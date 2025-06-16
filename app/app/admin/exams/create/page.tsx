import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";

interface Exam {
  id: string;
  title: string;
  duration: number;
  date: string;
  time: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Authentication error: You are not logged in.");
      window.location.href = "/login";
      throw new Error("No access token found.");
    }

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };


    let response = await fetch(url, { ...options, headers });

    
    if (response.status === 401) {
      console.log("Access token expired. Attempting to refresh...");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        setError("Your session has expired. Please log in again.");
        throw new Error("No refresh token found.");
      }

      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          setError("Your session has expired. Please log in again.");
          throw new Error("Failed to refresh token.");
        }

        const { accessToken: newAccessToken } = await refreshResponse.json();
        localStorage.setItem("accessToken", newAccessToken);

        console.log("Token refreshed. Retrying the original request...");
        headers["Authorization"] = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      } catch (e) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        throw e;
      }
    }

    return response;
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await authenticatedFetch("/api/admin/exams");
        if (response.ok) {
          const data = await response.json();
          setExams(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "An unknown error occurred while fetching exams.");
        }
      } catch (err: any) {
        console.error("fetchExams error:", err);

        if (err.message.includes("token")) {
          setError(err.message);
        }
      }
    };
    fetchExams();
  }, [authenticatedFetch]);

  const handleDelete = async (examId: string) => {
    if (confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
      try {
        const response = await authenticatedFetch(`/api/admin/exams/delete`, {
          method: "DELETE",
          body: JSON.stringify({ id: examId }),
        });

        if (response.ok) {
          setExams(exams.filter((exam) => exam.id !== examId));
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to delete the exam.");
        }
      } catch (err: any) {
        console.error("handleDelete error:", err);
        if (err.message.includes("token")) {
          setError(err.message);
        }
      }
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Exams</h1>
        <Button asChild>
          <Link href="/admin/exams/create">
            <Plus className="mr-2 h-4 w-4" />
            Add New Exam
          </Link>
        </Button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>A list of all created exams. You can edit or delete them from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 border-b last:border-b-0"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    <p className="text-sm text-gray-500">
                      {exam.date ? format(new Date(exam.date), "PPP") : "No date"} • {exam.duration}{" "}
                      minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/exams/edit/${exam.id}`}>Edit</Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(exam.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No exams found. Click "Add New Exam" to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}