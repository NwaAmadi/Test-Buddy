import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function DeleteExamPage() {
  const router = useRouter();
  const { id } = router.query;
  const accessToken = localStorage.getItem("accessToken");

  async function handleDelete() {
    await fetch(`/api/admin/exams/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    router.push("/admin/dashboard");
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delete Exam</h1>
        <p className="text-lg text-gray-500">Are you sure you want to delete this exam?</p>
        <div className="flex gap-4 mt-4">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}