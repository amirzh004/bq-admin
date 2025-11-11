"use client"

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/api/auth";
import { usePathname, useRouter } from "next/navigation";

export function AdminHeader() {
    const router = useRouter()

const handleLogout = () => {
  logout();
};

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#d9d9d9] px-6 py-4 w-full z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-[#aa0400] text-white px-4 py-2 rounded-lg font-bold text-xl">BQ</div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Админ-панель</h1>
            <p className="text-sm text-gray-500">Система управления</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-right">
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
