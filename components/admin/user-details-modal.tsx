"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User as UserIcon, Phone, Calendar, Star, Mail } from "lucide-react"
import type { PassengerInfo } from "@/lib/types/taxi"
import type { User } from "@/lib/types/models"

interface UserDetailsModalProps {
  user: PassengerInfo | User | null
  isOpen: boolean
  onClose: () => void
}

// Type guard to check if user is PassengerInfo
function isPassengerInfo(user: PassengerInfo | User): user is PassengerInfo {
  return 'full_name' in user && 'avatar_path' in user
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null

  const isPassenger = isPassengerInfo(user)
  const fullName = isPassenger 
    ? user.full_name 
    : `${user.name} ${user.surname} ${user.middlename || ''}`.trim()
  const avatarPath = isPassenger ? user.avatar_path : null
  const rating = isPassenger ? (user.rating || 0) : user.review_rating
  const phone = user.phone
  const email = isPassenger ? null : (user as User).email
  const updatedAt = isPassenger ? user.profile_updated_at : (user as User).updated_at

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Информация о пользователе</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {avatarPath ? (
                <img 
                  src={avatarPath} 
                  alt={fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{fullName}</div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                {rating}/5
                <span className="ps-2">ID: {user.id}</span>
              </div>
              
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Телефон</div>
                <div className="text-sm text-gray-600">{phone}</div>
              </div>
            </div>

            {email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-600">{email}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Профиль обновлен</div>
                <div className="text-sm text-gray-600">
                  {updatedAt ? 
                    new Date(updatedAt).toLocaleDateString('ru-RU') : 
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