import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Clock, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setFirstName(user.first_name || "Admin");
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {firstName}!</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </div>

      {/* Existing dashboard cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">+2 from last week</p>
          </CardContent>
        </Card>
        {/* Other cards */}
      </div>
    </DashboardLayout>
  );
}