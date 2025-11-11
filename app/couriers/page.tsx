// page.tsx
"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, RefreshCw, User, Phone, IdCard, Ban, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { courierAdminApi } from "@/lib/api/courier"
import { getApprovalStatus } from "@/lib/api/courier-utils"
import { Courier } from "@/lib/types/courier"
import { CourierDetailsModal } from "@/components/admin/courier-details-modal"

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([])
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
    total_couriers: 0,
    active_couriers: 0,
    free_couriers: 0,
    pending_couriers: 0,
    banned_couriers: 0
  })

  // Состояния для модального окна
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null)

  const loadCouriers = async (page: number = currentPage) => {
    try {
      setLoading(true)
      setError(null)
      const offset = page * limit
      const response = await courierAdminApi.getCouriers(limit, offset)
      setCouriers(response.couriers)
      setCurrentPage(page)
    } catch (err) {
      console.error("Failed to load couriers:", err)
      setError("Не удалось загрузить данные курьеров. Попробуйте обновить страницу.")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await courierAdminApi.getCouriersStats()
      setStats(statsData)
    } catch (err) {
      console.error("Failed to load stats:", err)
      setStats({
        total_couriers: 0,
        active_couriers: 0,
        free_couriers: 0,
        pending_couriers: 0,
        banned_couriers: 0
      })
    }
  }

  const handleRefresh = async () => {
    await Promise.all([loadCouriers(), loadStats()])
  }

  const handleOpenDetails = (courierId: number) => {
    setSelectedCourierId(courierId)
    setIsDetailsOpen(true)
  }

  const handleApproveCourier = async (courierId: number, status: "approved" | "rejected") => {
    try {
      setLoading(true)
      const updatedCourier = await courierAdminApi.approveCourier(courierId, status)
      
      // Обновляем локальное состояние
      setCouriers(prev => prev.map(courier => 
        courier.id === courierId 
          ? { ...courier, approval_status: updatedCourier.approval_status }
          : courier
      ))

      // Перезагружаем статистику после изменения статуса
      await loadStats()
    } catch (err) {
      console.error("Failed to update courier approval status:", err)
      setError("Не удалось обновить статус подтверждения курьера.")
    } finally {
      setLoading(false)
    }
  }

  const handleBanCourier = async (courierId: number, is_banned: boolean) => {
    try {
      setLoading(true)
      const updatedCourier = await courierAdminApi.banCourier(courierId, is_banned)
      
      // Обновляем локальное состояние - используем поле is_banned из ответа
      setCouriers(prev => prev.map(courier => 
        courier.id === courierId 
          ? { ...courier, is_banned: updatedCourier.is_banned }
          : courier
      ))

      // Перезагружаем статистику после изменения статуса
      await loadStats()
    } catch (err) {
      console.error("Failed to update courier ban status:", err)
      setError("Не удалось обновить статус блокировки курьера.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCouriers(0)
    loadStats()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = 
      courier.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier.phone?.includes(searchTerm) ||
      courier.iin?.includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || courier.status === statusFilter
    const matchesApproval = approvalFilter === "all" || courier.approval_status === approvalFilter
    const matchesBan = banFilter === "all" || 
      (banFilter === "banned" && courier.is_banned) || 
      (banFilter === "not_banned" && !courier.is_banned)
    
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

  const getBanBadge = (is_banned: boolean) => {
    return is_banned ? (
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

  const getCourierFullName = (courier: Courier) => {
    return `${courier.first_name || ''} ${courier.last_name || ''}`.trim() || `Курьер #${courier.id}`
  }

  // Пагинация
  const totalPages = Math.ceil(stats.total_couriers / limit)
  const canGoPrevious = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  if (loading && couriers.length === 0) {
    return (
      <div className="min-h-screen bg-[#efefef]">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64 mt-18">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка курьеров...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Курьеры</h1>
                <p className="text-gray-600">Управление зарегистрированными курьерами доставки</p>
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
                  <CardTitle className="text-sm font-medium">Всего курьеров</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_couriers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Онлайн</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active_couriers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Заблокированы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.banned_couriers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">На проверке</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pending_couriers}</div>
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
                      placeholder="Поиск по имени, ИИН или телефону..."
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

            {/* Couriers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCouriers.map((courier) => (
                <Card key={courier.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {getCourierFullName(courier)}
                      </CardTitle>
                      {courier.status && getStatusBadge(courier.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      ИИН: {courier.iin}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {courier.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Телефон:</span>
                        <span className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {courier.phone}
                        </span>
                      </div>
                    )}

                    {courier.rating !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Рейтинг:</span>
                        <span className="text-sm">
                          {courier.rating.toFixed(1)} ⭐
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Подтверждение:</span>
                      {getApprovalBadge(courier.approval_status)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Статус:</span>
                      {getBanBadge(courier.is_banned)}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-2 flex-wrap">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 min-w-[120px] cursor-pointer hover:bg-gray-200 hover:shadow-sm transition-all duration-200"
                        onClick={() => handleOpenDetails(courier.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Подробнее
                      </Button>
                      
                      {courier.approval_status === "pending" && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1 min-w-[120px] cursor-pointer hover:bg-green-600 transition-colors duration-200"
                            onClick={() => handleApproveCourier(courier.id, "approved")}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Подтвердить
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1 min-w-[120px] cursor-pointer hover:bg-red-700 transition-colors duration-200"
                            onClick={() => handleApproveCourier(courier.id, "rejected")}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Отклонить
                          </Button>
                        </>
                      )}
                      
                      {/* Кнопка блокировки/разблокировки */}
                      <Button 
                        variant={courier.is_banned ? "default" : "destructive"} 
                        size="sm" 
                        className="flex-1 min-w-[120px] cursor-pointer hover:opacity-90 transition-opacity duration-200"
                        onClick={() => handleBanCourier(courier.id, !courier.is_banned)}
                        disabled={loading}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        {courier.is_banned ? "Разблокировать" : "Заблокировать"}
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
                  Показано {couriers.length} из {stats.total_couriers} курьеров
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadCouriers(Math.max(0, currentPage - 1))}
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
                          onClick={() => loadCouriers(pageNum)}
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
                    onClick={() => loadCouriers(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={!canGoNext || loading}
                    className="text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                  >
                    Вперед
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {filteredCouriers.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Курьеры не найдены</h3>
                <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-600 gap-2">
                <span>Всего курьеров: {stats.total_couriers}</span>
                <div className="flex gap-4 flex-wrap">
                  <span className="text-green-600">Онлайн: {stats.active_couriers}</span>
                  <span className="text-blue-600">Свободны: {stats.free_couriers}</span>
                  <span className="text-orange-600">На проверке: {stats.pending_couriers}</span>
                  <span className="text-red-600">Заблокированы: {stats.banned_couriers}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CourierDetailsModal
        courierId={selectedCourierId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        couriers={couriers}
      />
    </div>
  )
}