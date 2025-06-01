'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, GraduationCap, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER;

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
      return;
    }
    if (!email) {
      setError("Email not found. Please go back to sign up.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/otp-verify`, { otp: otpValue, email });
      if (response.status === 200) {
        const role = response.data?.role;
        if (role === "admin") router.push("/admin/dashboard");
        else router.push("/student/dashboard");
      }
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      if (error.response) {
        setError(error.response.data?.error || error.response.data?.message || "Invalid OTP");
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email not found. Please go back to sign up.");
      return;
    }
    setIsResending(true);
    setError("");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/sendOtp`, { email });
      if (response.status === 200) {
        setTimeLeft(300); // Reset timer
        alert("A new OTP has been sent to your email");
      }
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      if (error.response) {
        setError(error.response.data?.error || error.response.data?.message || "Failed to resend OTP");
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to {email || 'your email'}. Enter it below to verify your account.
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
                  ref={(el) => { inputRefs.current[index] = el; }}
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

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Time remaining: <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
                className="text-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
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
  );
}
