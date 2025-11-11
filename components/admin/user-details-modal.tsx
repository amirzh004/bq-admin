"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Calendar, Star } from "lucide-react"
import type { PassengerInfo } from "@/lib/types/taxi"

interface UserDetailsModalProps {
  user: PassengerInfo | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Информация о пользователе</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {user.avatar_path ? (
                <img 
                  src={user.avatar_path} 
                  alt={user.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{user.full_name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                {user.rating || 0}/5
                <h2 className="ps-2">ID: {user.id}</h2>
              </div>
              
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Телефон</div>
                <div className="text-sm text-gray-600">{user.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Профиль обновлен</div>
                <div className="text-sm text-gray-600">
                  {user.profile_updated_at ? 
                    new Date(user.profile_updated_at).toLocaleDateString('ru-RU') : 
                    'Не указано'
                  }
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}