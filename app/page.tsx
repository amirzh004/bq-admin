"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UsersTable } from "@/components/admin/users-table"
import { UserDetailsModal } from "@/components/admin/user-details-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Download } from "lucide-react"
import { usersApi } from "@/lib/api"
import type { User } from "@/components/admin/users-table"
import { useToast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterRole, setFilterRole] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await usersApi.getUsers()
      setUsers(data)
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Добавляем лоадинг
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#efefef]">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64 mt-18">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка пользователей...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        `${user.name} ${user.surname} ${user.middlename}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      const matchesRole = 
        filterRole === "all" ? true :
        filterRole === "admin" ? user.role === "admin" :
        user.role !== "admin" // "user" фильтр показывает всех НЕ админов
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "email":
          return a.email.localeCompare(b.email)
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "review_rating":
          return b.review_rating - a.review_rating
        default:
          return 0
      }
    })

  const handleDeleteUser = async (id: number) => {
    try {
      await usersApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast({
        title: "Успешно",
        description: "Пользователь удалён",
      })
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      })
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64 mt-18">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
                <p className="text-gray-600">
                  Просмотр списка зарегистрированных пользователей и управление их данными.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Поиск по имени, email или телефону..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Сортировать по" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">По имени</SelectItem>
                      <SelectItem value="email">По email</SelectItem>
                      <SelectItem value="created_at">По дате регистрации</SelectItem>
                      <SelectItem value="review_rating">По рейтингу</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все роли</SelectItem>
                      <SelectItem value="admin">Администраторы</SelectItem>
                      <SelectItem value="user">Пользователи</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-[#aa0400] hover:bg-[#8a0300] text-white flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Добавить пользователя
                  </Button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              <UsersTable users={filteredUsers} onDeleteUser={handleDeleteUser} onViewUser={handleViewUser} />
            </div>

            {/* Stats */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Показано {filteredUsers.length} из {users.length} пользователей
                </span>
                <span>Администраторов: {users.filter((u) => u.role === "admin").length}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal user={selectedUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}