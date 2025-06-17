"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
  GraduationCap,
  Video,
  FileSpreadsheet,
  NotebookPen,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "admin" | "student"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
    {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return null
  }
  
  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Exams",
      href: "/admin/exams/create",
      icon: FileText,
    },
    {
      title: "Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      title: "Proctoring",
      href: "/admin/proctoring",
      icon: Video,
    },
    {
      title: "Results",
      href: "/admin/results",
      icon: FileSpreadsheet,
    },
    {
      title: "Questions",
      href: "/admin/exams/questions",
      icon: NotebookPen,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]
  
  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Exams",
      href: "/student/[id]/exams",
      icon: FileText,
    },
    {
      title: "Results",
      href: "/student/results",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/student/settings",
      icon: Settings,
    },
  ]
  
  const navItems = role === "admin" ? adminNavItems : studentNavItems
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Test Buddy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {role === "admin" ? "Administrator" : "Student"} Portal
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-gray-100 dark:bg-gray-700 text-primary" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Link>
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 justify-between">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Test Buddy</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === "admin" ? "Administrator" : "Student"} Portal
                  </p>
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? "bg-gray-100 dark:bg-gray-700 text-primary" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="md:hidden flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">Test Buddy</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>
                      {role === "admin" ? "AD" : "ST"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

}