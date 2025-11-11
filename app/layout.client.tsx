"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { checkAdminAuth } from "@/lib/utils/auth-utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      // <CHANGE> Updated login path from /admin/login to /login
      if (pathname === "/login") {
        setIsLoading(false)
        return
      }

      // Проверяем аутентификацию
      const isAuth = checkAdminAuth()
      setIsAuthenticated(isAuth)

      if (!isAuth) {
        // <CHANGE> Updated redirect path from /admin/login to /login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  // <CHANGE> Updated login path check from /admin/login to /login
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return children
}
