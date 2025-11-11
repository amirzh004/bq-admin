"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, FileText, FolderOpen, Car, Navigation, ListOrdered, MessageSquareWarning, Package} from "lucide-react"

const navigation = [
  { name: "Пользователи", href: "/", icon: Users },
  { name: "Объявления", href: "/listings", icon: FileText },
  { name: "Категории", href: "/categories", icon: FolderOpen },
  { name: "Жалобы", href: "/complaints", icon: MessageSquareWarning },
  { name: "Водители", href: "/drivers", icon: Car },
  { name: "Курьеры", href: "/couriers", icon: Package },
  { name: "Заказы такси", href: "/taxi-orders", icon: ListOrdered },
  { name: "Межгород", href: "/intercity-orders", icon: Navigation },

]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-[#d9d9d9]">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-[#aa0400] text-white cursor-default" 
                        : "text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
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