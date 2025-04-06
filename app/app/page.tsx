import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, GraduationCap, Clock, FileCheck, Video, FileSpreadsheet } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Test Buddy</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Secure Online Exams Made Simple</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive platform for conducting secure online examinations with advanced proctoring features.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader className="pb-2">
              <Shield className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Secure Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced security features to prevent cheating and ensure exam integrity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Video className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Dual Proctoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Choose between manual proctoring with live video feeds or automatic AI-powered proctoring.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Clock className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Timed Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Automatic timing and submission to ensure fair assessment for all students.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <FileCheck className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Immediate scoring and detailed analytics for both students and administrators.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <FileSpreadsheet className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Export Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Generate and download exam results in Excel format for easy record-keeping.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <GraduationCap className="h-12 w-12 text-primary mb-2" />
              <CardTitle>For All Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Suitable for schools, universities, and professional certification exams.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Create an Account</h3>
                    <p className="text-gray-600 dark:text-gray-400">Sign up as a student or administrator.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Verify Your Identity</h3>
                    <p className="text-gray-600 dark:text-gray-400">Complete OTP verification for added security.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Schedule or Join Exams</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Admins create exams, students join scheduled exams.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Take the Exam</h3>
                    <p className="text-gray-600 dark:text-gray-400">Complete the exam within the allocated time.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold">View Results</h3>
                    <p className="text-gray-600 dark:text-gray-400">Get instant feedback and detailed analytics.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-80 flex items-center justify-center">
              <img
                src="/placeholder.svg?height=300&width=400"
                alt="Platform demonstration"
                className="rounded-lg max-h-full"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Test Buddy</span>
          </div>
          <p>© 2025 Test Buddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

