"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, Phone, Mail, Calendar, FileText } from "lucide-react"
import type { User as ApiUser } from "@/lib/types/models"

interface UserDetailsModalProps {
  user: ApiUser | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Детали пользователя</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {user.name} {user.surname}
              </h3>
              <p className="text-gray-500">ID: {user.id}</p>
            </div>
            <Badge variant={user.role === "active" ? "default" : "secondary"}>
              {user.role === "active" ? "Активный" : "Неактивный"}
            </Badge>
          </div>

          <Separator />

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-3">Контактная информация</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>—</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div>
            <h4 className="font-semibold mb-3">Статистика</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Дата регистрации</span>
                </div>
                <p className="font-semibold">{formatDate(user.created_at)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Объявления</span>
                </div>
                <p className="font-semibold">—</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-600">Рейтинг</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{user.review_rating}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(user.review_rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity */}
          <div>
            <h4 className="font-semibold mb-3">Последняя активность</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Данных об активности нет</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
