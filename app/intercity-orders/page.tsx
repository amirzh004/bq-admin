// page.tsx - исправленная версия
"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, User, Car, Navigation, Phone, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { taxiAdminApi } from "@/lib/api/taxi"
import type { IntercityOrder, PassengerInfo, DriverInfo } from "@/lib/types/taxi"
import { UserDetailsModal } from "@/components/admin/user-details-modal"
import { DriverDetailsModal } from "@/components/admin/intercity-driver-details-modal"

export default function IntercityOrdersPage() {
  const [orders, setOrders] = useState<IntercityOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tripTypeFilter, setTripTypeFilter] = useState("all")
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(0)
  const limit = 20
  
  // Статистика
  const [stats, setStats] = useState({
    total_orders: 0,
    active_orders: 0,
    completed_orders: 0,
    canceled_orders: 0
  })

  // Состояния для модалок
  const [selectedUser, setSelectedUser] = useState<PassengerInfo | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverInfo | null>(null)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false)
  const [selectedDriverContactPhone, setSelectedDriverContactPhone] = useState<string>('')

  const loadOrders = async (page: number = currentPage) => {
    try {
      setLoading(true)
      setError(null)
      const offset = page * limit
      const response = await taxiAdminApi.getIntercityOrders(limit, offset)
      setOrders(response.orders || [])
      setCurrentPage(page)
    } catch (err) {
      console.error("Failed to load intercity orders:", err)
      setError("Не удалось загрузить межгородские заказы. Попробуйте обновить страницу.")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await taxiAdminApi.getIntercityOrdersStats()
      setStats(statsData)
    } catch (err) {
      console.error("Failed to load stats:", err)
      setStats({
        total_orders: 0,
        active_orders: 0,
        completed_orders: 0,
        canceled_orders: 0
      })
    }
  }

  const handleRefresh = async () => {
    await Promise.all([loadOrders(), loadStats()])
  }

  useEffect(() => {
    loadOrders(0)
    loadStats()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Функции для открытия модалок
  const handleViewUserDetails = (user: PassengerInfo) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleViewDriverDetails = (driver: DriverInfo, contactPhone?: string) => {
    setSelectedDriver(driver)
    setSelectedDriverContactPhone(contactPhone || '')
    setIsDriverModalOpen(true)
  }

  // Безопасная фильтрация
  const filteredOrders = orders.filter(order => {
    const passengerName = order.passenger?.full_name || ''
    const driverName = order.driver?.full_name || ''
    const from = order.from || ''
    const to = order.to || ''
    const contactPhone = order.contact_phone || ''

    const matchesSearch = 
      passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contactPhone.includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesTripType = tripTypeFilter === "all" || order.trip_type === tripTypeFilter
    
    return matchesSearch && matchesStatus && matchesTripType
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "default",
      closed: "secondary"
    } as const

    const labels = {
      open: "Активный",
      closed: "Завершен"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getTripTypeBadge = (tripType: string) => {
    const variants = {
      solo: "default",
      companions: "secondary",
      parcel: "outline"
    } as const

    const labels = {
      solo: "Один пассажир",
      companions: "Попутчики",
      parcel: "Посылка"
    }

    return (
      <Badge variant={variants[tripType as keyof typeof variants] || "outline"}>
        {labels[tripType as keyof typeof labels] || tripType}
      </Badge>
    )
  }

  const getCreatorRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "driver" ? "default" : "secondary"}>
        {role === "driver" ? "Водитель" : "Пассажир"}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return `${price?.toLocaleString() || '0'} ₸`
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date)
    return `${dateObj.toLocaleDateString('ru-RU')} ${time}`
  }

  // Безопасное получение имени создателя
  const getCreatorName = (order: IntercityOrder) => {
    if (order.creator_role === "driver" && order.driver) {
      return order.driver.full_name
    } else if (order.creator_role === "passenger" && order.passenger) {
      return order.passenger.full_name
    }
    return "Неизвестно"
  }

  // Пагинация
  const totalPages = Math.ceil(stats.total_orders / limit)
  const canGoPrevious = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#efefef]">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64 mt-18">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка межгородских заказов...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
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
                <h1 className="text-3xl font-bold text-gray-900">Межгородские заказы</h1>
                <p className="text-gray-600">Управление заказами такси между городами</p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_orders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Активные</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active_orders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Завершены</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.completed_orders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Отменены</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.canceled_orders}</div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Поиск по имени, городам или телефону..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="open">Активные</SelectItem>
                      <SelectItem value="closed">Завершенные</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={tripTypeFilter} onValueChange={setTripTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Тип поездки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="solo">Один пассажир</SelectItem>
                      <SelectItem value="companions">Попутчики</SelectItem>
                      <SelectItem value="parcel">Посылка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CardTitle>Заказ #{order.id}</CardTitle>
                        {getStatusBadge(order.status)}
                        {getTripTypeBadge(order.trip_type)}
                        {getCreatorRoleBadge(order.creator_role)}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(order.price)}
                        </div>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleString('ru-RU')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Route Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{order.from}</div>
                        <div className="text-sm text-gray-600 mt-1">Откуда</div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Navigation className="h-6 w-6 text-blue-500" />
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{order.to}</div>
                        <div className="text-sm text-gray-600 mt-1">Куда</div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Дата и время:</span>
                          <span className="text-sm">{formatDateTime(order.departure_date, order.departure_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Контактный телефон:</span>
                          <span className="text-sm">{order.contact_phone}</span>
                        </div>
                        {order.comment && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium">Комментарий:</span>
                            <span className="text-sm text-gray-600 flex-1">{order.comment}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Создатель:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getCreatorName(order)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (order.creator_role === "driver" && order.driver) {
                                  handleViewDriverDetails(order.driver, order.contact_phone)
                                } else if (order.creator_role === "passenger" && order.passenger) {
                                  handleViewUserDetails(order.passenger)
                                }
                              }}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {order.driver && order.creator_role !== "driver" && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Водитель:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{order.driver.full_name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDriverDetails(order.driver!, order.contact_phone)}
                              >
                                <Car className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {order.passenger && order.creator_role !== "passenger" && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Пассажир:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{order.passenger.full_name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUserDetails(order.passenger!)}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-gray-600">
                        {order.closed_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Завершен: {new Date(order.closed_at).toLocaleString('ru-RU')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Межгородские заказы не найдены</h3>
                <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Показано {orders.length} из {stats.total_orders} заказов
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadOrders(Math.max(0, currentPage - 1))}
                    disabled={!canGoPrevious || loading}
                    className="text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Назад
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i
                      } else if (currentPage <= 2) {
                        pageNum = i
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 5 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      if (pageNum < 0 || pageNum >= totalPages) return null
                      
                      const isActive = currentPage === pageNum

                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          size="sm"
                          onClick={() => loadOrders(pageNum)}
                          disabled={loading}
                          className={`w-8 h-8 p-0 ${
                            isActive 
                              ? "bg-[#aa0400] text-white cursor-default hover:bg-[#aa0400] hover:text-white" 
                              : "text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                          }`}
                        >
                          {pageNum + 1}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadOrders(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={!canGoNext || loading}
                    className="text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                  >
                    Вперед
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Всего заказов: {stats.total_orders}</span>
                <div className="flex gap-4">
                  <span className="text-green-600">Активные: {stats.active_orders}</span>
                  <span className="text-blue-600">Завершены: {stats.completed_orders}</span>
                  <span className="text-red-600">Отменены: {stats.canceled_orders}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Модалки */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedUser(null)
        }}
      />

      <DriverDetailsModal
        driver={selectedDriver}
        contactPhone={selectedDriverContactPhone}
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false)
          setSelectedDriver(null)
          setSelectedDriverContactPhone('')
        }}
      />
    </div>
  )
}