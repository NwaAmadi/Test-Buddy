"use client"

import { useRefreshToken } from "@/hooks/useRefreshToken"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useRefreshToken()
  return <>{children}</>
}
