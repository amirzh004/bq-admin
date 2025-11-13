"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, FileText, FolderOpen, Logs, Car, Navigation, ListOrdered, MessageSquareWarning, Package, X} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Пользователи", href: "/", icon: Users },
  { name: "Объявления", href: "/listings", icon: FileText },
  { name: "Категории", href: "/categories", icon: FolderOpen },
  { name: "Жалобы", href: "/complaints", icon: MessageSquareWarning },
  { name: "Водители", href: "/drivers", icon: Car },
  { name: "Заказы такси", href: "/taxi-orders", icon: ListOrdered },
  { name: "Курьеры", href: "/couriers", icon: Package },
  { name: "Заказы доставки", href: "/courier-orders", icon: Logs },
  { name: "Межгород", href: "/intercity-orders", icon: Navigation },

]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 bg-white border-r border-[#d9d9d9] z-50 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex justify-end p-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
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
    </>
  )
}