"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eye, Trash2, Star } from "lucide-react"
import type { User } from "@/lib/types/models"

interface UsersTableProps {
  users: User[]
  onDeleteUser: (id: number) => void
  onViewUser: (user: User) => void
}

export function UsersTable({ users, onDeleteUser, onViewUser }: UsersTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)

  const handleDelete = (userId: number) => {
    onDeleteUser(userId)
    setDeletingUserId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU")
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Пользователь</TableHead>
            <TableHead className="min-w-[200px] hidden sm:table-cell">Контакты</TableHead>
            <TableHead className="min-w-[120px] hidden md:table-cell">Дата регистрации</TableHead>
            <TableHead className="min-w-[100px]">Роль</TableHead>
            <TableHead className="min-w-[80px]">Рейтинг</TableHead>
            <TableHead className="text-right min-w-[100px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const userRole =
              user.role === "admin"
                ? "Администратор"
                : user.role === "worker"
                  ? "Исполнитель"
                  : user.role === "client"
                    ? "Клиент"
                    : "Не указан"
            return (
              <TableRow key={user.id}>
                <TableCell className="min-w-[200px]">
                  <div>
                    <div className="font-medium text-sm">
                      {user.surname} {user.name} {user.middlename}
                    </div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                    <div className="text-xs sm:hidden mt-1 text-gray-600">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px] hidden sm:table-cell">
                  <div>
                    <div className="text-sm">{user.email}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{user.phone}</div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[120px] hidden md:table-cell text-xs sm:text-sm">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="min-w-[100px]">
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "destructive"
                        : user.role === "worker"
                          ? "default"
                          : user.role === "client"
                            ? "client"
                            : "secondary"
                    }
                    className="text-xs"
                  >
                    {userRole}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[80px]">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">{user.review_rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right min-w-[100px]">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewUser(user)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 cursor-pointer h-8 w-8 p-0"
                          onClick={() => setDeletingUserId(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[90vw]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить пользователя "{user.name}"? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
