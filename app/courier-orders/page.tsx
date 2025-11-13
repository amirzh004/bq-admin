// page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCw,
  MapPin,
  Clock,
  DollarSign,
  User,
  Package,
  Phone,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Star,
  Mail,
  Shield,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { courierAdminApi } from "@/lib/api/courier";
import { CourierOrder } from "@/lib/types/courier";
import {
  formatPrice,
  formatDuration,
  formatDistance,
  getOrderStatus,
  getPaymentMethod,
  getMainAddress,
} from "@/lib/api/courier-utils";

export default function CourierOrdersPage() {
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Пагинация
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 20;

  // Статистика
  const [stats, setStats] = useState({
    total_orders: 0,
    active_orders: 0,
    completed_orders: 0,
    canceled_orders: 0,
  });

  // Modal states
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);
  const [selectedSender, setSelectedSender] = useState<any | null>(null);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadOrders = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const offset = page * limit;
      const response = await courierAdminApi.getCourierOrders(limit, offset);

      // Обрабатываем ответ API
      const ordersData = response.orders || response || [];
      
      const ordersWithSafeAddresses = ordersData.map((order: any) => ({
        ...order,
        route_points: order.route_points || [],
        completed_at: order.completed_at || null,
        updated_at: order.updated_at || order.created_at,
      }));

      setOrders(ordersWithSafeAddresses);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Не удалось загрузить заказы. Попробуйте обновить страницу.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await courierAdminApi.getCourierOrdersStats();
      const processedStats = {
        total_orders: statsData.total_orders || 0,
        active_orders: statsData.active_orders || 0,
        completed_orders: statsData.completed_orders || 0,
        canceled_orders: statsData.canceled_orders || 0,
      };
      setStats(processedStats);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats({
        total_orders: 0,
        active_orders: 0,
        completed_orders: 0,
        canceled_orders: 0,
      });
    }
  };

  const openCourierModal = (order: CourierOrder) => {
    if (order.courier) {
      setSelectedCourier(order.courier);
      setShowCourierModal(true);
    }
  };

  const openSenderModal = (order: CourierOrder) => {
    if (order.sender) {
      setSelectedSender(order.sender);
      setShowSenderModal(true);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadOrders(), loadStats()]);
  };

  useEffect(() => {
    loadOrders(0);
    loadStats();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.sender_id.toString().includes(searchTerm) ||
      (order.courier_id && order.courier_id.toString().includes(searchTerm)) ||
      order.route_points.some(point => 
        point.address.toLowerCase().includes(searchLower)
      );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.payment_method === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    const { label, variant } = getOrderStatus(status);
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPaymentBadge = (method: string) => {
    const { label, variant } = getPaymentMethod(method);
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCourierInfo = (courierId: number | null) => {
    return courierId ? `Курьер #${courierId}` : "Не назначен";
  };

  const getSenderInfo = (senderId: number) => {
    return `Отправитель #${senderId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDetailedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Пагинация
  const totalPages = Math.ceil(stats.total_orders / limit);
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

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
                <p className="mt-2 text-sm text-gray-600">
                  Загрузка заказов...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      <AdminHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 mt-[73px] lg:ml-64 w-full lg:w-[calc(100%-16rem)] overflow-visible relative z-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Заказы доставки
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Управление и мониторинг заказами доставки
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Всего заказов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_orders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Активные
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.active_orders}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Завершены
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed_orders}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Отменены
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.canceled_orders}
                  </div>
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
                      placeholder="Поиск по ID заказа, отправителя, курьера или адресу..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="new">Новый</SelectItem>
                      <SelectItem value="searching">Поиск курьера</SelectItem>
                      <SelectItem value="assigned">Назначен</SelectItem>
                      <SelectItem value="courier_arrived">Курьер прибыл</SelectItem>
                      <SelectItem value="pickup_started">Забор начат</SelectItem>
                      <SelectItem value="pickup_done">Забор завершен</SelectItem>
                      <SelectItem value="delivery_started">Доставка начата</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                      <SelectItem value="completed">Завершен</SelectItem>
                      <SelectItem value="canceled">Отменен</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={paymentFilter}
                    onValueChange={setPaymentFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Оплата" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все методы</SelectItem>
                      <SelectItem value="online">Онлайн</SelectItem>
                      <SelectItem value="cash">Наличные</SelectItem>
                      <SelectItem value="card">Карта</SelectItem>
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
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                const { from, to } = getMainAddress(order.route_points);

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Заказ #{order.id}
                        </CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <CardDescription>
                        {formatDate(order.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Sender Info */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Отправитель:
                        </span>
                        <span className="text-sm">
                          {getSenderInfo(order.sender_id)}
                        </span>
                      </div>

                      {/* Courier Info */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Курьер:
                        </span>
                        <span className="text-sm">
                          {getCourierInfo(order.courier_id)}
                        </span>
                      </div>

                      {/* Route Info */}
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          Маршрут:
                        </span>
                        <div className="text-sm text-right max-w-[60%]">
                          <div className="truncate" title={from}>📦 {from}</div>
                          <div className="truncate" title={to}>🏠 {to}</div>
                        </div>
                      </div>

                      {/* Distance */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          Дистанция:
                        </span>
                        <span className="text-sm">{formatDistance(order.distance_m)}</span>
                      </div>

                      {/* Time */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Время:
                        </span>
                        <span className="text-sm">{formatDuration(order.eta_s)}</span>
                      </div>

                      {/* Price */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Цена:
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatPrice(order.client_price)}
                        </span>
                      </div>

                      {/* Payment Method */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Оплата:</span>
                        {getPaymentBadge(order.payment_method)}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 cursor-pointer hover:bg-gray-200 hover:shadow-sm transition-all duration-200"
                          onClick={() => openSenderModal(order)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Отправитель
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!order.courier_id}
                          className="cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => openCourierModal(order)}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Курьер
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Пагинация */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Показано {filteredOrders.length} из {stats.total_orders} заказов
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
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage <= 2) {
                        pageNum = i;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum < 0 || pageNum >= totalPages) return null;

                      const isActive = currentPage === pageNum;

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
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      loadOrders(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={!canGoNext || loading}
                    className="text-gray-700 hover:bg-[#eaeaea] hover:text-[#aa0400] cursor-pointer"
                  >
                    Вперед
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {filteredOrders.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Заказы не найдены
                </h3>
                <p className="text-gray-500">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-600 gap-2">
                <span>Всего заказов: {stats.total_orders}</span>
                <div className="flex gap-4 flex-wrap">
                  <span className="text-blue-600">Активные: {stats.active_orders}</span>
                  <span className="text-green-600">Завершены: {stats.completed_orders}</span>
                  <span className="text-red-600">Отменены: {stats.canceled_orders}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Courier Modal */}
      <Dialog open={showCourierModal} onOpenChange={setShowCourierModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Информация о курьере
            </DialogTitle>
            <DialogDescription>Детальная информация о курьере заказа</DialogDescription>
          </DialogHeader>

          {selectedCourier && (
            <div className="space-y-6">
              {/* Основная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="font-medium">ID курьера:</span>
                      <span className="font-semibold">#{selectedCourier.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">ID пользователя:</span>
                      <span>#{selectedCourier.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">ФИО:</span>
                      <span className="font-semibold">
                        {selectedCourier.last_name} {selectedCourier.first_name} 
                        {selectedCourier.middle_name && ` ${selectedCourier.middle_name}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Телефон:</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedCourier.phone}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Статус:</span>
                      <Badge variant={
                        selectedCourier.status === 'online' ? 'default' : 
                        selectedCourier.status === 'offline' ? 'secondary' : 'outline'
                      }>
                        {selectedCourier.status === 'online' ? 'Онлайн' : 
                         selectedCourier.status === 'offline' ? 'Офлайн' : 
                         selectedCourier.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Рейтинг:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{selectedCourier.rating || 0}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Баланс:</span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(selectedCourier.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Статус блокировки:</span>
                      <Badge variant={selectedCourier.is_banned ? "destructive" : "default"}>
                        {selectedCourier.is_banned ? "Заблокирован" : "Активен"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Документы */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Документы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="font-medium">ИИН:</span>
                      <span>{selectedCourier.iin || "Не указан"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Дата рождения:</span>
                      <span>
                        {selectedCourier.date_of_birth ? 
                          formatDetailedDate(selectedCourier.date_of_birth) : 
                          "Не указана"
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Фотографии документов */}
                  <div className="space-y-3">
                    <div className="font-medium">Фотографии документов:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCourier.courier_photo && (
                        <div className="text-center">
                          <div className="font-medium text-sm mb-2">Фото курьера</div>
                          <div className="bg-gray-100 rounded-lg p-4">
                            <img 
                              src={selectedCourier.courier_photo} 
                              alt="Фото курьера"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                          </div>
                        </div>
                      )}
                      {selectedCourier.id_card_front && (
                        <div className="text-center">
                          <div className="font-medium text-sm mb-2">Удостоверение (лицевая)</div>
                          <div className="bg-gray-100 rounded-lg p-4">
                            <img 
                              src={selectedCourier.id_card_front} 
                              alt="Удостоверение лицевая"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                          </div>
                        </div>
                      )}
                      {selectedCourier.id_card_back && (
                        <div className="text-center">
                          <div className="font-medium text-sm mb-2">Удостоверение (оборотная)</div>
                          <div className="bg-gray-100 rounded-lg p-4">
                            <img 
                              src={selectedCourier.id_card_back} 
                              alt="Удостоверение оборотная"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Временные метки */}
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Дата регистрации:</span>
                    <span>{formatDetailedDate(selectedCourier.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Последнее обновление:</span>
                    <span>{formatDetailedDate(selectedCourier.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCourierModal(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sender Modal */}
      <Dialog open={showSenderModal} onOpenChange={setShowSenderModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Информация об отправителе
            </DialogTitle>
          </DialogHeader>

          {selectedSender && (
            <div className="space-y-6">
              {/* Основная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {selectedSender.avatar_path ? (
                        <img 
                          src={selectedSender.avatar_path} 
                          alt={selectedSender.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {selectedSender.surname} {selectedSender.name} {selectedSender.middlename}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          selectedSender.role === 'admin' ? 'destructive' :
                          selectedSender.role === 'worker' ? 'default' :
                          selectedSender.role === 'client' ? 'secondary' : 'outline'
                        }>
                          {selectedSender.role === 'admin' ? 'Администратор' :
                           selectedSender.role === 'worker' ? 'Исполнитель' :
                           selectedSender.role === 'client' ? 'Клиент' : selectedSender.role}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{selectedSender.review_rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">ID отправителя:</span>
                      <span className="font-semibold">#{selectedSender.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Город ID:</span>
                      <span>#{selectedSender.city_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Телефон:</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedSender.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedSender.email}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Статус онлайн:</span>
                    <Badge variant={selectedSender.is_online ? "default" : "secondary"}>
                      {selectedSender.is_online ? "Онлайн" : "Офлайн"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>


              {/* Временные метки */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Временные метки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Дата регистрации:</span>
                    <span>{formatDetailedDate(selectedSender.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Последнее обновление:</span>
                    <span>{formatDetailedDate(selectedSender.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSenderModal(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}