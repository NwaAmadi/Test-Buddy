"use client"
import dotenv from 'dotenv';
dotenv.config();
import type React from "react"
import { Toaster, toast } from 'sonner'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, GraduationCap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  const [first_name, setFirstName] = useState("")
  const [last_name, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("student")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)


  const BACKEND_URL= process.env.NEXT_PUBLIC_SERVER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    if (role === "admin" && !accessCode) {
      toast.error("Admin access code is required");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/signup` || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          role,
          verified: false,
          access_code: accessCode || undefined,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
  
      toast.success("Account created! Redirecting to OTP verification...");
      router.push(`/verify-otp?email=${email}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create a Test Buddy account</CardTitle>
          <CardDescription className="text-center">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input id="first_name" placeholder="John" value={first_name} onChange={(e) => setFirstName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Last Name</Label>
              <Input id="last_name" placeholder="Doe" value={last_name} onChange={(e) => setLastName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup defaultValue="student" value={role} onValueChange={setRole} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Administrator</Label>
                </div>
              </RadioGroup>
            </div>

            {role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="accessCode">Admin Access Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter admin access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required={role === "admin"}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin accounts require a special access code. Contact your system administrator if you don't have one.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

