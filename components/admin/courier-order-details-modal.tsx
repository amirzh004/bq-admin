"use client"

import { useState, useEffect } from "react" 
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Phone, MapPin, Calendar, DollarSign, Package, Clock, Navigation, CheckCircle, XCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrderStatus, getPaymentMethod, formatPrice, formatDistance, formatDuration } from "@/lib/api/courier-utils"
import { CourierOrder } from "@/lib/types/courier"

interface CourierOrderDetailsModalProps {
  orderId: number | null
  isOpen: boolean
  onClose: () => void
  orders: CourierOrder[]
}

export function CourierOrderDetailsModal({ orderId, isOpen, onClose, orders }: CourierOrderDetailsModalProps) {
  const [order, setOrder] = useState<CourierOrder | null>(null)

  // Находим заказ из переданного списка
  useEffect(() => {
    if (!orderId || !isOpen) {
      setOrder(null)
      return
    }
    
    const foundOrder = orders.find(o => o.id === orderId)
    setOrder(foundOrder || null)
  }, [orderId, isOpen, orders])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'canceled_by_sender':
      case 'canceled_by_courier':
      case 'canceled_no_show':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-blue-500" />
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
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden"
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
                  Заказ доставки #{order?.id}
                </h2>
                <p className="text-gray-600">Детальная информация о заказе курьерской доставки</p>
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

            {order ? (
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Order Status & Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Статус заказа
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">Статус:</span>
                        </div>
                        <Badge variant={getOrderStatus(order.status).variant}>
                          {getOrderStatus(order.status).label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Цена клиента</div>
                            <div className="font-semibold">{formatPrice(order.client_price)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Рекомендованная цена</div>
                            <div className="font-semibold">{formatPrice(order.recommended_price)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Дистанция</div>
                            <div className="font-semibold">{formatDistance(order.distance_m)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">Время доставки</div>
                            <div className="font-semibold">{formatDuration(order.eta_s)}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment & Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Оплата и контакты
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Способ оплаты</div>
                          <Badge variant={getPaymentMethod(order.payment_method).variant}>
                            {getPaymentMethod(order.payment_method).label}
                          </Badge>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Отправитель</div>
                          <div className="font-medium">ID: {order.sender_id}</div>
                        </div>
                      </div>

                      {order.courier_id && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Курьер</div>
                          <div className="font-medium">ID: {order.courier_id}</div>
                          {order.courier && (
                            <div className="text-sm text-gray-600 mt-1">
                              {order.courier.first_name} {order.courier.last_name}
                            </div>
                          )}
                        </div>
                      )}

                      {order.comment && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Комментарий</div>
                          <div className="text-sm bg-gray-50 p-3 rounded-md">
                            {order.comment}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Route Points */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Маршрут доставки
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.route_points.map((point, index) => (
                          <div key={index} className="flex gap-4 p-3 border rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium mb-2">{point.address}</div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Координаты:</span>
                                  <div>{point.lat.toFixed(6)}, {point.lon.toFixed(6)}</div>
                                </div>
                                
                                <div className="space-y-1">
                                  {point.entrance && (
                                    <div><span className="font-medium">Подъезд:</span> {point.entrance}</div>
                                  )}
                                  {point.intercom && (
                                    <div><span className="font-medium">Домофон:</span> {point.intercom}</div>
                                  )}
                                  {point.floor && (
                                    <div><span className="font-medium">Этаж:</span> {point.floor}</div>
                                  )}
                                  {point.apt && (
                                    <div><span className="font-medium">Квартира:</span> {point.apt}</div>
                                  )}
                                  {point.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{point.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Временная шкала
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <TimelineItem 
                          date={order.created_at}
                          title="Заказ создан"
                          description="Заказ был создан отправителем"
                        />
                        
                        {order.updated_at && order.updated_at !== order.created_at && (
                          <TimelineItem 
                            date={order.updated_at}
                            title="Последнее обновление"
                            description="Статус заказа был изменен"
                          />
                        )}
                        
                        <div className="pt-2">
                          <div className="text-sm text-gray-600">
                            Текущий статус: <span className="font-medium">{getOrderStatus(order.status).label}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Заказ не найден</p>
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
const TimelineItem = ({ date, title, description }: { date: string; title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      <div className="flex-1 w-0.5 bg-gray-200 mt-1"></div>
    </div>
    <div className="flex-1 pb-4">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(date).toLocaleString('ru-RU')}
      </div>
    </div>
  </div>
)

const InfoRow = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
)