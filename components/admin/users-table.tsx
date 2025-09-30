"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, Star } from "lucide-react";
import type { User } from "@/lib/types/models";

interface UsersTableProps {
  users: User[];
  onDeleteUser: (id: number) => void;
  onViewUser: (user: User) => void;
}

export function UsersTable({
  users,
  onDeleteUser,
  onViewUser,
}: UsersTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const handleDelete = (userId: number) => {
    onDeleteUser(userId);
    setDeletingUserId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Пользователь</TableHead>
          <TableHead>Контакты</TableHead>
          <TableHead>Дата регистрации</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead>Рейтинг</TableHead>
          <TableHead className="text-right">Действия</TableHead>
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
              : "Не указан";
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {user.surname} {user.name} {user.middlename}
                  </div>
                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell>
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
                >
                  {userRole}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{user.review_rating}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewUser(user)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setDeletingUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Удалить пользователя?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите удалить пользователя "
                          {user.name}"? Это действие нельзя отменить.
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
          );
        })}
      </TableBody>
    </Table>
  );
}
