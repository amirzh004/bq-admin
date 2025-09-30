"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Users, FileText, FolderOpen, Home, ChevronLeft, ChevronRight, MessageSquareWarning } from "lucide-react"

const navigation = [
  { name: "Пользователи", href: "/", icon: Users },
  { name: "Объявления", href: "/listings", icon: FileText },
  { name: "Категории", href: "/categories", icon: FolderOpen },
  { name: "Жалобы", href: "/complaints", icon: MessageSquareWarning },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "fixed left-0 top-[73px] h-[calc(100vh-73px)] bg-white border-r border-[#d9d9d9] transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-[#aa0400]"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-[#aa0400] text-white" : "text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400]",
                      collapsed && "justify-center",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
