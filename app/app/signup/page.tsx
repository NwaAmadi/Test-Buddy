"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

export default function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "student",
    accessCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showAccessCode, setShowAccessCode] = useState(false)

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleNext = () => {
    if (step === 1 && (!form.first_name || !form.last_name || !form.email)) {
      toast.info("Please fill all fields")
      return
    }

    if (step === 1 && !isValidEmail(form.email)) {
      toast.info("Please enter a valid email address")
      return
    }

    if (step === 2 && form.role === "admin" && !form.accessCode) {
      toast.info("Please enter the admin access code")
      return
    }

    setStep(step + 1)
  }

  const handlePrev = () => setStep(step - 1)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (!BACKEND_URL) {
        toast.info("Backend URL is not configured")
        setIsLoading(false)
        return
      }

      const response = await fetch(`${BACKEND_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          role: form.role,
          verified: false,
          access_code: form.accessCode || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.message === "STUDENT NOT FOUND") {
          toast.error(" STUDENT NOT RECOGNIZED! ");
        } else {
          toast.error(data.message || "Signup failed");
        }
        setIsLoading(false);
        return;
      }

      const sendOtp = await axios.post(`${BACKEND_URL}/api/sendOtp`, {
        email: form.email,
      })
      if (!sendOtp.data.success) {
        toast.success(sendOtp.data.message)
      }

      toast.success("Account created! OTP sent to your email. Redirecting...")
      router.push(`/verify-otp?email=${form.email}`)

    } catch (error) {
      toast.info("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-all duration-300">
      <Card className="w-full max-w-md animate-fadeIn border-2 border-gray-300 dark:border-gray-600">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Step {step} of 2</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <Input
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <RadioGroup value={form.role} onValueChange={(val) => handleChange("role", val)}>
                  <div className="flex justify-center gap-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin">Admin</Label>
                    </div>
                  </div>
                </RadioGroup>

                {form.role === "admin" && (
                  <div className="relative">
                    <Input
                      type={showAccessCode ? "text" : "password"}
                      placeholder="Admin Access Code"
                      value={form.accessCode}
                      onChange={(e) => handleChange("accessCode", e.target.value)}
                      required
                    />
                    <div
                      className="absolute right-3 top-2.5 cursor-pointer"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                    >
                      {showAccessCode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 && <Button onClick={handlePrev}>Back</Button>}
          {step < 2 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "Sign Up"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
