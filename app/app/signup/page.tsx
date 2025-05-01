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
import axios from 'axios'




export default function SignupPage() {
  const router = useRouter()
  const [first_name, setFirstName] = useState("")
  const [last_name, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password_hash, setPassword_hash] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("student")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const BACKEND_URL= process.env.NEXT_PUBLIC_SERVER
  const sendOtp = async (email: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/sendOtp`, {
        email,
      });
  
      return response
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP. Please try again.");
      console.error('Failed to send OTP:', error);
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (password_hash !== confirmPassword) {
      toast.info("Passwords do not match");
      return;
    }
  
    if (role === "admin" && !accessCode) {
      toast.info("Admin access code is required");
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
          password_hash,
          role,
          verified: false,
          access_code: accessCode || undefined,
        }),
      });
  
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        let message

        if (data.message === "EMAIL ALREADY REGISTERED") {
          message = "Email already registered. Please use a different email.";
        } else if (data.message === "INVALID ROLE") {
          message = "Invalid role selected. Please choose either 'student' or 'admin'.";
        }
        else if (data.message === "ALL FIELDS ARE REQUIRED") {
          message = "All fields are required. Please fill in all the fields.";
        }
        else if (data.message === "ACCESS CODE IS REQUIRED FOR ADMIN ROLE") {
          message = "Access code is required for admin role. Please provide the access code.";
        }
        else if (data.message === "INVALID ADMIN ACCESS CODE") {
          message = "Invalid admin access code. Please check the code and try again.";
        }
        toast.error(message)
        return
      }
  
      toast.success("Account created! Redirecting to OTP verification...");
      const sendResponse = await sendOtp(email);
      if (sendResponse?.status !== 200) {
        let message
        if (sendResponse?.data?.message === "EMAIL REQUIRED") {
          message = "Please provide a valid email address.";
        }
        else if( sendResponse?.data?.message === "TOO MANY REQUESTS") {
          message = "Too many requests. Please try again later.";
        }
        toast.error(message);
        return;
      }
      router.push(`/verify-otp?email=${email}`);
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      toast.error("Failed to create account. Please try again.");
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
                value={password_hash}
                onChange={(e) => setPassword_hash(e.target.value)}
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

