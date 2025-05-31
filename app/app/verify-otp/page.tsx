"use client"

export const dynamic = "force-dynamic"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, GraduationCap, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email"

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter a complete 6-digit OTP")
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const role = "student"
      router.push(role === "admin" ? "/admin/dashboard" : "/student/dashboard")
    } catch (err) {
      setError("Invalid OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setTimeLeft(300)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setError("")
      alert(`A new OTP has been sent to ${email}`)
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            A one-time password has been sent to <span className="font-semibold">{email}</span>. <br />
            Enter the 6-digit code below to verify your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Time remaining: <span className="font-mono">{formatTime(timeLeft)}</span>
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || otp.join("").length !== 6}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0}
                  className="text-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/signup">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}