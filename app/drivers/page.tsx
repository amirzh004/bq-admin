// page.tsx
"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, RefreshCw, User, Car, Phone, IdCard, Ban, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { taxiAdminApi } from "@/lib/api/taxi"
import { getApprovalStatus } from "@/lib/api/taxi-utils"
import { Driver } from "@/lib/types/taxi"
import { DriverDetailsModal } from "@/components/admin/driver-details-modal"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")
  const [banFilter, setBanFilter] = useState("all")
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(0)
  const limit = 20
  
  // Статистика
  const [stats, setStats] = useState({
    total_drivers: 0,
    online_drivers: 0,
    free_drivers: 0,
    pending_drivers: 0,
    banned_drivers: 0
  })

  // Состояния для модального окна
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null)

  const loadDrivers = async (page: number = currentPage) => {
    try {
      setLoading(true)
      setError(null)
      const offset = page * limit
      const response = await taxiAdminApi.getDrivers(limit, offset)
      setDrivers(response.drivers)
      setCurrentPage(page)
    } catch (err) {
      console.error("Failed to load drivers:", err)
      setError("Не удалось загрузить данные водителей. Попробуйте обновить страницу.")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await taxiAdminApi.getDriversStats()
      setStats(statsData)
    } catch (err) {
      console.error("Failed to load stats:", err)
      // Устанавливаем значения по умолчанию, чтобы пагинация работала
      setStats({
        total_drivers: 0,
        online_drivers: 0,
        free_drivers: 0,
        pending_drivers: 0,
        banned_drivers: 0
      })
    }
  }

  const handleRefresh = async () => {
    await Promise.all([loadDrivers(), loadStats()])
  }

  const handleOpenDetails = (driverId: number) => {
    setSelectedDriverId(driverId)
    setIsDetailsOpen(true)
  }

  const handleApproveDriver = async (driverId: number, status: "approved" | "rejected") => {
    try {
      setLoading(true)
      const updatedDriver = await taxiAdminApi.approveDriver(driverId, status)
      
      // Обновляем локальное состояние
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, approval_status: updatedDriver.approval_status }
          : driver
      ))

      // Перезагружаем статистику после изменения статуса
      await loadStats()
    } catch (err) {
      console.error("Failed to update driver approval status:", err)
      setError("Не удалось обновить статус подтверждения водителя.")
    } finally {
      setLoading(false)
    }
  }

  const handleBanDriver = async (driverId: number, banned: boolean) => {
    try {
      setLoading(true)
      const updatedDriver = await taxiAdminApi.banDriver(driverId, banned)
      
      // Обновляем локальное состояние
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, is_banned: updatedDriver.is_banned }
          : driver
      ))

      // Перезагружаем статистику после изменения статуса
      await loadStats()
    } catch (err) {
      console.error("Failed to update driver ban status:", err)
      setError("Не удалось обновить статус блокировки водителя.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrivers(0)
    loadStats()
  }, [])

  useEffect(() => {
    // Прокрутка наверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.car_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.car_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm) ||
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.surname?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter
    const matchesApproval = approvalFilter === "all" || driver.approval_status === approvalFilter
    const matchesBan = banFilter === "all" || 
      (banFilter === "banned" && driver.is_banned) || 
      (banFilter === "not_banned" && !driver.is_banned)
    
    return matchesSearch && matchesStatus && matchesApproval && matchesBan
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      offline: "secondary",
      busy: "destructive",
      free: "default"
    } as const

    const labels = {
      online: "Онлайн",
      offline: "Офлайн",
      busy: "Занят",
      free: "Свободен"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getApprovalBadge = (status: string) => {
    const { label, variant } = getApprovalStatus(status)
    return <Badge variant={variant}>{label}</Badge>
  }

  const getBanBadge = (isBanned: boolean) => {
    return isBanned ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Ban className="h-3 w-3" />
        Заблокирован
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Активен
      </Badge>
    )
  }

  const getDriverFullName = (driver: Driver) => {
    return `${driver.name || ''} ${driver.surname || ''}`.trim() || `Водитель #${driver.id}`
  }

  // Пагинация
  const totalPages = Math.ceil(stats.total_drivers / limit)
  const canGoPrevious = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  if (loading && drivers.length === 0) {
    return (
      <div className="min-h-screen bg-[#efefef]">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64 mt-18">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка водителей...</p>
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
        <main className="flex-1 p-6 ml-64 mt-18 overflow-visible relative z-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Водители</h1>
                <p className="text-gray-600">Управление зарегистрированными водителями такси</p>
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
                  <CardTitle className="text-sm font-medium">Всего водителей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_drivers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Онлайн</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.online_drivers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Свободны</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.free_drivers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">На проверке</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending_drivers}</div>
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
                      placeholder="Поиск по имени, машине, номеру или телефону..."
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
                      <SelectItem value="online">Онлайн</SelectItem>
                      <SelectItem value="offline">Офлайн</SelectItem>
                      <SelectItem value="busy">Занят</SelectItem>
                      <SelectItem value="free">Свободен</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Подтверждение" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="pending">На проверке</SelectItem>
                      <SelectItem value="approved">Подтверждены</SelectItem>
                      <SelectItem value="rejected">Отклонены</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={banFilter} onValueChange={setBanFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Блокировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="banned">Заблокированы</SelectItem>
                      <SelectItem value="not_banned">Активны</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 cursor-pointer bg-transparent hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => (
                <Card key={driver.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {getDriverFullName(driver)}
                      </CardTitle>
                      {getStatusBadge(driver.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {driver.car_model || "Не указана"} • {driver.car_color || "Не указан"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Номер машины:</span>
                      <Badge variant="outline">{driver.car_number}</Badge>
                    </div>
                    
                    {driver.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Телефон:</span>
                        <span className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {driver.phone}
                        </span>
                      </div>
                    )}

                    {driver.rating !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Рейтинг:</span>
                        <span className="text-sm">
                          {driver.rating.toFixed(1)} ⭐
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Подтверждение:</span>
                      {getApprovalBadge(driver.approval_status)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Статус:</span>
                      {getBanBadge(driver.is_banned)}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-2 flex-wrap">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 min-w-[120px] cursor-pointer hover:bg-gray-200 hover:shadow-sm transition-all duration-200"
                        onClick={() => handleOpenDetails(driver.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Подробнее
                      </Button>
                      
                      {driver.approval_status === "pending" && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1 min-w-[120px] cursor-pointer hover:bg-green-600 transition-colors duration-200"
                            onClick={() => handleApproveDriver(driver.id, "approved")}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Подтвердить
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1 min-w-[120px] cursor-pointer hover:bg-red-700 transition-colors duration-200"
                            onClick={() => handleApproveDriver(driver.id, "rejected")}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Отклонить
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant={driver.is_banned ? "default" : "destructive"} 
                        size="sm" 
                        className="flex-1 min-w-[120px] cursor-pointer hover:opacity-90 transition-opacity duration-200"
                        onClick={() => handleBanDriver(driver.id, !driver.is_banned)}
                        disabled={loading}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        {driver.is_banned ? "Разблокировать" : "Заблокировать"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

           {/* Пагинация */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Показано {drivers.length} из {stats.total_drivers} водителей
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDrivers(Math.max(0, currentPage - 1))}
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

                      // Защита от выхода за пределы
                      if (pageNum < 0 || pageNum >= totalPages) return null

                      const isActive = currentPage === pageNum

                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          size="sm"
                          onClick={() => loadDrivers(pageNum)}
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
                    onClick={() => loadDrivers(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={!canGoNext || loading}
                    className="text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                  >
                    Вперед
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {filteredDrivers.length === 0 && (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Водители не найдены</h3>
                <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-600 gap-2">
                <span>Всего водителей: {stats.total_drivers}</span>
                <div className="flex gap-4 flex-wrap">
                  <span className="text-green-600">Онлайн: {stats.online_drivers}</span>
                  <span className="text-blue-600">Свободны: {stats.free_drivers}</span>
                  <span className="text-orange-600">На проверке: {stats.pending_drivers}</span>
                  <span className="text-red-600">Заблокированы: {stats.banned_drivers}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <DriverDetailsModal
        driverId={selectedDriverId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        drivers={drivers}
      />
    </div>
  )
}