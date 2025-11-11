"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Car, Calendar, Star } from "lucide-react"
import type { DriverInfo } from "@/lib/types/taxi"

interface DriverDetailsModalProps {
  driver: DriverInfo | null
  contactPhone: string
  isOpen: boolean
  onClose: () => void
}

export function DriverDetailsModal({ driver, contactPhone, isOpen, onClose }: DriverDetailsModalProps) {
  if (!driver) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Информация о водителе</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {driver.avatar_path ? (
                <img 
                  src={driver.avatar_path} 
                  alt={driver.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{driver.full_name}</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {driver.rating || 0}/5
                </div>
                <Badge variant="default">
                  Активен
                </Badge>
                <h2 className="text-gray-600">ID: {driver.id}</h2>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Контактный телефон</div>
                <div className="text-sm text-gray-600">
                  {contactPhone || 'Не указано'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Автомобиль</div>
                <div className="text-sm text-gray-600">
                  {driver.car_model || 'Не указано'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Рейтинг</div>
                <div className="text-sm text-gray-600">{driver.rating || 0}/5</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Профиль обновлен</div>
                <div className="text-sm text-gray-600">
                  {driver.profile_updated_at ? 
                    new Date(driver.profile_updated_at).toLocaleDateString('ru-RU') : 
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