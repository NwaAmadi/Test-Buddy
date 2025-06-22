"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Papa from "papaparse"
import { AuthProvider } from "@/components/AuthProvider"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

interface Student {
    id?: string
    first_name: string
    last_name: string
    email: string
}

export default function AdminStudents() {
    const [students, setStudents] = useState<Student[]>([])
    const [first_name, setFirstName] = useState("")
    const [last_name, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [dbStudents, setDbStudents] = useState<Student[]>([])

    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/students`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            if (res.ok) {
                const data = await res.json()
                setDbStudents(data)
            } else {
                toast.error("Failed to fetch students")
            }
        } catch (err) {
            toast.error("Error fetching students")
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    const addStudentToList = () => {
        if (!first_name || !last_name || !email) {
            toast.error("All fields are required!")
            return
        }
        setStudents([...students, { first_name, last_name, email }])
        setFirstName("")
        setLastName("")
        setEmail("")
    }

    const submitStudents = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/students/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ students }),
            })

            if (res.ok) {
                toast.success("Students uploaded successfully!")
                setStudents([])
                fetchStudents()
            } else {
                toast.error("Upload failed")
            }
        } catch (err) {
            toast.error("Error uploading students")
        }
    }

    const deleteStudent = async (id: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/students/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            if (res.ok) {
                toast.success("Student deleted")
                setDbStudents((prev) => prev.filter((s) => s.id !== id))
            } else {
                toast.error("Failed to delete student")
            }
        } catch (err) {
            toast.error("Error deleting student")
        }
    }

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const parsedStudents = (results.data as any[])
                    .filter((s: any) => s.first_name && s.last_name && s.email) as Student[]
                setStudents((prev) => [...prev, ...parsedStudents])
                toast.success("Students added from file!")
            },
        })
    }

    return (
            <DashboardLayout role="admin">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Manage Students</h1>
                    <p className="text-muted-foreground">Add or upload students, view and delete from the list.</p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Add New Student</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>First Name</Label>
                                <Input value={first_name} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div>
                                <Label>Last Name</Label>
                                <Input value={last_name} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={addStudentToList}>Add</Button>
                            <Button onClick={submitStudents} disabled={students.length === 0}>Submit All</Button>
                            <Label className="text-sm font-medium cursor-pointer">
                                Upload Excel
                                <Input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleExcelUpload}
                                />
                            </Label>
                        </div>
                        {students.length > 0 && (
                            <div className="mt-4">
                                <p className="font-semibold">Students to be uploaded:</p>
                                <ul className="list-disc pl-6">
                                    {students.map((s, idx) => (
                                        <li key={idx}>{s.first_name} {s.last_name} ({s.email})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Registered Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {dbStudents.map((student) => (
                                <li key={student.id} className="flex justify-between py-2">
                                    <span>{student.first_name} {student.last_name} ({student.email})</span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteStudent(student.id!)}
                                    >
                                        Delete
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </DashboardLayout>
    )
}
