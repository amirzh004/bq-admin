"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth";

import { LogOut, Menu } from "lucide-react";
import { logout } from "@/lib/api/auth";
import { usePathname, useRouter } from "next/navigation";

interface AdminHeaderProps {
  onMenuToggle?: () => void
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
    const router = useRouter()

const handleLogout = () => {
  logout();
};

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#d9d9d9] px-4 sm:px-6 py-4 w-full z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden h-8 w-8 p-0 mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="bg-[#aa0400] text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-lg sm:text-xl">BQ</div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Админ-панель</h1>
            <p className="text-xs sm:text-sm text-gray-500">Система управления</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Администратор</p>
              <p className="text-xs text-gray-500">admin</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="cursor-pointer text-gray-600 hover:text-[#aa0400]">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
