"use client"

import { useState, useEffect } from "react" 
import { motion, AnimatePresence } from "framer-motion"
import { X, IdCard, User, Phone, RefreshCw, Car, Ban, CheckCircle, Star, MapPin, Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { getApprovalStatus } from "@/lib/api/taxi-utils"
import { Driver } from "@/lib/types/taxi"
import { taxiAdminApi } from "@/lib/api/taxi"

interface DriverDetailsModalProps {
  driverId: number | null
  isOpen: boolean
  onClose: () => void
  drivers: Driver[]
}
type GalleryPhoto = { 
  url: string; 
  label: string;
  type: 'driver' | 'documents' | 'car';
}

export function DriverDetailsModal({ driverId, isOpen, onClose, drivers }: DriverDetailsModalProps) {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [activeGallery, setActiveGallery] = useState<'all' | 'driver' | 'documents' | 'car'>('all')

  // Находим водителя из переданного списка
  useEffect(() => {
    if (!driverId || !isOpen) {
      setDriver(null)
      return
    }
    
    const foundDriver = drivers.find(d => d.id === driverId)
    setDriver(foundDriver || null)
  }, [driverId, isOpen, drivers])

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      setCurrentPhotoIndex(0)
      setActiveGallery('all')
    }
  }, [isOpen])

  const getDriverFullName = (driver: Driver) => {
    return `${driver.name || ''} ${driver.surname || ''}`.trim() || `Водитель #${driver.id}`
  }

  const getGalleryPhotos = (): GalleryPhoto[] => {
    if (!driver) return []

    const photos: GalleryPhoto[] = []

    // Фото водителя
    if (driver.driver_photo) {
      photos.push({ 
        url: driver.driver_photo, 
        label: "Фото водителя", 
        type: 'driver' 
      })
    }

    // Документы
    if (driver.id_card_front) {
      photos.push({ 
        url: driver.id_card_front, 
        label: "Удостоверение (лицевая сторона)", 
        type: 'documents' 
      })
    }
    if (driver.id_card_back) {
      photos.push({ 
        url: driver.id_card_back, 
        label: "Удостоверение (обратная сторона)", 
        type: 'documents' 
      })
    }
    if (driver.tech_passport) {
      photos.push({ 
        url: driver.tech_passport, 
        label: "Технический паспорт", 
        type: 'documents' 
      })
    }

    // Фото автомобиля
    if (driver.car_photo_front) {
      photos.push({ 
        url: driver.car_photo_front, 
        label: `${driver.car_model || 'Автомобиль'} - спереди`, 
        type: 'car' 
      })
    }
    if (driver.car_photo_back) {
      photos.push({ 
        url: driver.car_photo_back, 
        label: `${driver.car_model || 'Автомобиль'} - сзади`, 
        type: 'car' 
      })
    }
    if (driver.car_photo_left) {
      photos.push({ 
        url: driver.car_photo_left, 
        label: `${driver.car_model || 'Автомобиль'} - слева`, 
        type: 'car' 
      })
    }
    if (driver.car_photo_right) {
      photos.push({ 
        url: driver.car_photo_right, 
        label: `${driver.car_model || 'Автомобиль'} - справа`, 
        type: 'car' 
      })
    }

    return photos
  }

  const filteredPhotos = getGalleryPhotos().filter(photo => 
    activeGallery === 'all' || photo.type === activeGallery
  )

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === filteredPhotos.length - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === 0 ? filteredPhotos.length - 1 : prev - 1
    )
  }

  const handleGalleryFilter = (filter: typeof activeGallery) => {
    setActiveGallery(filter)
    setCurrentPhotoIndex(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50'
      case 'offline': return 'text-gray-600 bg-gray-50'
      case 'busy': return 'text-orange-600 bg-orange-50'
      case 'free': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Онлайн'
      case 'offline': return 'Офлайн'
      case 'busy': return 'Занят'
      case 'free': return 'Свободен'
      default: return status
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {driver ? getDriverFullName(driver) : "Информация о водителе"}
                </h2>
                <p className="text-gray-600">Полная информация о водителе и транспортном средстве</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p>Загрузка данных...</p>
                </div>
              </div>
            ) : 
            driver ? (
              <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Gallery */}
                <div className="w-1/2 border-r p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Галерея</h3>
                    <div className="flex gap-1">
                      {(['all', 'driver', 'documents', 'car'] as const).map(filter => (
                        <Button
                          key={filter}
                          variant={activeGallery === filter ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleGalleryFilter(filter)}
                          className="text-xs"
                        >
                          {filter === 'all' && 'Все'}
                          {filter === 'driver' && 'Водитель'}
                          {filter === 'documents' && 'Документы'}
                          {filter === 'car' && 'Авто'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {filteredPhotos.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                      {/* Main Photo */}
                      <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={filteredPhotos[currentPhotoIndex].url}
                          alt={filteredPhotos[currentPhotoIndex].label}
                          fill
                          className="object-contain"
                          quality={90}
                        />
                        
                        {/* Navigation Arrows */}
                        {filteredPhotos.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                              onClick={prevPhoto}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                              onClick={nextPhoto}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {/* Photo Label */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {filteredPhotos[currentPhotoIndex].label}
                        </div>

                        {/* Photo Counter */}
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {currentPhotoIndex + 1} / {filteredPhotos.length}
                        </div>
                      </div>

                      {/* Thumbnails */}
                      {filteredPhotos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {filteredPhotos.map((photo, index) => (
                            <button
                              key={index}
                              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                                index === currentPhotoIndex 
                                  ? 'border-[#aa0400] ring-2 ring-[#aa0400]' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              onClick={() => setCurrentPhotoIndex(index)}
                            >
                              <Image
                                src={photo.url}
                                alt={photo.label}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      Нет доступных фотографий
                    </div>
                  )}
                </div>

                {/* Right Side - Details */}
                <ScrollArea className="w-1/2 p-6">
                  <div className="space-y-6">
                    {/* Basic Info Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Основная информация
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <InfoRow label="ID водителя" value={driver.id} />
                        <InfoRow label="ID пользователя" value={driver.user_id} />
                        <InfoRow label="ФИО" value={getDriverFullName(driver)} />
                        <InfoRow label="Телефон" value={driver.phone || "Не указан"} />
                        <InfoRow label="ИИН" value={driver.iin || "Не указан"} />
                        <InfoRow 
                          label="Рейтинг" 
                          value={
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {driver.rating?.toFixed(1) || "0.0"}
                            </div>
                          } 
                        />
                        <InfoRow 
                          label="Баланс" 
                          value={driver.balance ? `${driver.balance.toLocaleString()} ₸` : "0 ₸"} 
                        />
                        {driver.updated_at && (
                          <InfoRow 
                            label="Последнее обновление" 
                            value={new Date(driver.updated_at).toLocaleString('ru-RU')} 
                          />
                        )}
                      </CardContent>
                    </Card>

                    {/* Car Info Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          Информация об автомобиле
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <InfoRow label="Модель" value={driver.car_model || "Не указана"} />
                        <InfoRow label="Цвет" value={driver.car_color || "Не указан"} />
                        <InfoRow label="Гос. номер" value={driver.car_number} />
                        <InfoRow label="Тех. паспорт" value={driver.tech_passport || "Не указан"} />
                      </CardContent>
                    </Card>

                    {/* Status Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Статусы</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Статус водителя:</span>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(driver.status)}
                          >
                            {getStatusLabel(driver.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Статус подтверждения:</span>
                          <Badge variant={getApprovalStatus(driver.approval_status).variant}>
                            {getApprovalStatus(driver.approval_status).label}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Блокировка:</span>
                          <Badge variant={driver.is_banned ? "destructive" : "default"}>
                            {driver.is_banned ? "Заблокирован" : "Активен"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Водитель не найден</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper Components
const InfoRow = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
)