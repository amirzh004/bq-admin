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
  Car,
  Phone,
  Navigation,
  ChevronLeft,
  ChevronRight,
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
import { taxiAdminApi } from "@/lib/api/taxi";
import { TaxiOrder, Driver, Passenger } from "@/lib/types/taxi";
import {
  formatPrice,
  formatDuration,
  formatDistance,
  getOrderStatus,
  getPaymentMethod,
  getMainAddress,
} from "@/lib/api/taxi-utils";

export default function TaxiOrdersPage() {
  const [orders, setOrders] = useState<TaxiOrder[]>([]);
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
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<TaxiOrder | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadOrders = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const offset = page * limit;
      const response = await taxiAdminApi.getTaxiOrders(limit, offset);

      const ordersWithSafeAddresses = response.orders.map((order) => ({
        ...order,
        addresses: order.addresses || [],
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
      const statsData = await taxiAdminApi.getTaxiOrdersStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load stats:", err);
      // Устанавливаем значения по умолчанию, чтобы пагинация работала
      setStats({
        total_orders: 0,
        active_orders: 0,
        completed_orders: 0,
        canceled_orders: 0,
      });
    }
  };

  const openDriverModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const openPassengerModal = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setShowPassengerModal(true);
  };

  const openOrderModal = (order: TaxiOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleRefresh = async () => {
    await Promise.all([loadOrders(), loadStats()]);
  };

  useEffect(() => {
    loadOrders(0);
    loadStats();
  }, []);

  useEffect(() => {
    // Прокрутка наверх при смене страницы
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filteredOrders = orders.filter((order) => {
    const passengerName =
      `${order.passenger.name} ${order.passenger.surname}`.toLowerCase();
    const driverName = order.driver
      ? `${order.driver.name} ${order.driver.surname}`.toLowerCase()
      : "";
    const { from, to } = getMainAddress(order.addresses);

    const matchesSearch =
      passengerName.includes(searchTerm.toLowerCase()) ||
      order.passenger.phone.includes(searchTerm) ||
      from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || order.payment_method === paymentFilter;

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

  const getDriverFullName = (driver: Driver) => {
    return `${driver.name} ${driver.surname}`;
  };

  const getPassengerFullName = (passenger: Passenger) => {
    return `${passenger.name} ${passenger.surname}`;
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
        <main className="flex-1 p-4 sm:p-6 mt-[73px] lg:ml-64 w-full lg:w-[calc(100%-16rem)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Заказы такси
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Управление заказами такси и мониторинг поездок
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
                  <div className="text-2xl font-bold text-green-600">
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
                  <div className="text-2xl font-bold text-blue-600">
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
                      placeholder="Поиск по клиенту, адресу или телефону..."
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
                      <SelectItem value="created">Создан</SelectItem>
                      <SelectItem value="searching">Поиск водителя</SelectItem>
                      <SelectItem value="accepted">Принят</SelectItem>
                      <SelectItem value="assigned">Назначен</SelectItem>
                      <SelectItem value="driver_at_pickup">
                        Водитель на месте
                      </SelectItem>
                      <SelectItem value="waiting_free">
                        Ожидание бесплатное
                      </SelectItem>
                      <SelectItem value="waiting_paid">
                        Ожидание платное
                      </SelectItem>
                      <SelectItem value="in_progress">В пути</SelectItem>
                      <SelectItem value="at_last_point">
                        На последней точке
                      </SelectItem>
                      <SelectItem value="arrived">Прибыл</SelectItem>
                      <SelectItem value="picked_up">
                        Пассажир в машине
                      </SelectItem>
                      <SelectItem value="completed">Завершен</SelectItem>
                      <SelectItem value="paid">Оплачен</SelectItem>
                      <SelectItem value="closed">Закрыт</SelectItem>
                      <SelectItem value="not_found">Не найден</SelectItem>
                      <SelectItem value="canceled">Отменен</SelectItem>
                      <SelectItem value="canceled_by_passenger">
                        Отменен пассажиром
                      </SelectItem>
                      <SelectItem value="canceled_by_driver">
                        Отменен водителем
                      </SelectItem>
                      <SelectItem value="no_show">
                        Пассажир не явился
                      </SelectItem>
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
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const { from, to } = getMainAddress(order.addresses);
                const stops = order.addresses.slice(1, -1);

                return (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CardTitle>Заказ #{order.id}</CardTitle>
                          {getStatusBadge(order.status)}
                          {getPaymentBadge(order.payment_method)}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPrice(order.client_price)}
                          </div>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleString("ru-RU")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Route Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {from}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Откуда
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <Navigation className="h-6 w-6 text-blue-500" />
                        </div>

                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {to}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Куда</div>
                        </div>
                      </div>

                      {/* Stops */}
                      {stops.length > 0 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="font-medium text-sm mb-2">
                            Остановки:
                          </div>
                          <div className="space-y-1">
                            {stops.map((stop, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-600 flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4 text-yellow-500" />
                                {stop.address}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Passenger and Driver Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Пассажир:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {getPassengerFullName(order.passenger)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPassengerModal(order.passenger)}
                                className="flex items-center gap-2 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 transition-colors duration-200 cursor-pointer"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {order.passenger.phone}
                          </div>
                        </div>

                        {order.driver && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Водитель:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {getDriverFullName(order.driver)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDriverModal(order.driver!)}
                                  className="flex items-center gap-2 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 transition-colors duration-200 cursor-pointer"
                                >
                                  <Car className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {order.driver.phone}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Trip Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(order.eta_s)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {formatDistance(order.distance_m)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Реком. цена: {formatPrice(order.recommended_price)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3">
                        <div className="text-sm text-gray-600">
                          {order.completed_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Завершен:{" "}
                              {new Date(order.completed_at).toLocaleString(
                                "ru-RU"
                              )}
                            </div>
                          )}
                        </div>
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

                      // Защита от выхода за пределы
                      if (pageNum < 0 || pageNum >= totalPages) return null;

                      const isActive = currentPage === pageNum;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
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

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Всего заказов: {stats.total_orders}</span>
                <div className="flex gap-4">
                  <span className="text-green-600">
                    Активные: {stats.active_orders}
                  </span>
                  <span className="text-blue-600">
                    Завершено: {stats.completed_orders}
                  </span>
                  <span className="text-red-600">
                    Отменено: {stats.canceled_orders}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Детали заказа #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Полная информация о заказе такси
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Информация о заказе
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Статус:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Способ оплаты:</span>
                      {getPaymentBadge(selectedOrder.payment_method)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Цена для клиента:</span>
                      <span className="font-bold text-green-600">
                        {formatPrice(selectedOrder.client_price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Рекомендованная цена:</span>
                      <span>
                        {formatPrice(selectedOrder.recommended_price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Расстояние:</span>
                      <span>{formatDistance(selectedOrder.distance_m)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Время в пути:</span>
                      <span>{formatDuration(selectedOrder.eta_s)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Создан:</span>
                      <span>
                        {new Date(selectedOrder.created_at).toLocaleString(
                          "ru-RU"
                        )}
                      </span>
                    </div>
                    {selectedOrder.completed_at && (
                      <div className="flex justify-between">
                        <span className="font-medium">Завершен:</span>
                        <span>
                          {new Date(selectedOrder.completed_at).toLocaleString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Route Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Маршрут</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Откуда</div>
                          <div className="text-sm text-gray-600">
                            {getMainAddress(selectedOrder.addresses).from}
                          </div>
                        </div>
                      </div>

                      {selectedOrder.addresses
                        .slice(1, -1)
                        .map((stop, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <div>
                              <div className="font-medium">
                                Остановка {index + 1}
                              </div>
                              <div className="text-sm text-gray-600">
                                {stop.address}
                              </div>
                            </div>
                          </div>
                        ))}

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Куда</div>
                          <div className="text-sm text-gray-600">
                            {getMainAddress(selectedOrder.addresses).to}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderModal(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Modal */}
      <Dialog open={showDriverModal} onOpenChange={setShowDriverModal}>
        <DialogContent
          style={{ width: 800, maxWidth: 1200 }}
          className="max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-6 w-6" />
              Информация о водителе
            </DialogTitle>
            <DialogDescription className="text-base">
              Полная информация о водителе и его транспортном средстве
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Личная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-base">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">ФИО:</span>
                      <span className="text-right">
                        {getDriverFullName(selectedDriver)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Телефон:</span>
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedDriver.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">ИИН:</span>
                      <span>{selectedDriver.iin || "Не указан"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Статус:</span>
                      <Badge
                        variant={
                          selectedDriver.is_banned ? "destructive" : "default"
                        }
                        className="text-sm"
                      >
                        {selectedDriver.is_banned ? "Заблокирован" : "Активен"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Подтверждение:</span>
                      <Badge
                        variant={
                          selectedDriver.approval_status === "approved"
                            ? "default"
                            : selectedDriver.approval_status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-sm"
                      >
                        {selectedDriver.approval_status === "approved"
                          ? "Подтвержден"
                          : selectedDriver.approval_status === "pending"
                          ? "На проверке"
                          : "Отклонен"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold">Рейтинг:</span>
                      <span className="flex items-center gap-1">
                        {selectedDriver.rating} ⭐
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">
                      Информация об автомобиле
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-base">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Модель:</span>
                      <span>{selectedDriver.car_model || "Не указана"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Цвет:</span>
                      <span>{selectedDriver.car_color || "Не указан"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Номер:</span>
                      <Badge variant="outline" className="text-sm font-mono">
                        {selectedDriver.car_number}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold">Тех. паспорт:</span>
                      <span>{selectedDriver.tech_passport || "Не указан"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold">Статус водителя:</span>
                      <Badge
                        variant={
                          selectedDriver.status === "online"
                            ? "default"
                            : selectedDriver.status === "offline"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-sm"
                      >
                        {selectedDriver.status === "online"
                          ? "Онлайн"
                          : selectedDriver.status === "offline"
                          ? "Офлайн"
                          : "Занят"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents */}
              {selectedDriver.driver_photo && (
                <Card className="p-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">
                      Документы и фотографии
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">
                          Фото водителя
                        </h4>
                        <img
                          src={selectedDriver.driver_photo}
                          alt="Фото водителя"
                          className="w-full h-56 object-cover rounded-lg border"
                        />
                      </div>

                      {selectedDriver.id_card_front && (
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">
                            Удостоверение (лицевая сторона)
                          </h4>
                          <img
                            src={selectedDriver.id_card_front}
                            alt="Удостоверение лицевая"
                            className="w-full h-56 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDriverModal(false)}
                  className="px-6 py-2 text-base"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Passenger Modal */}
      <Dialog open={showPassengerModal} onOpenChange={setShowPassengerModal}>
        <DialogContent style={{ width: 800, maxWidth: 1200 }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Информация о клиенте
            </DialogTitle>
            <DialogDescription>Полная информация о пассажире</DialogDescription>
          </DialogHeader>

          {selectedPassenger && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Личная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">ФИО:</span>
                      <span>{getPassengerFullName(selectedPassenger)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Телефон:</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedPassenger.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedPassenger.email || "Не указан"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Рейтинг:</span>
                      <span>{selectedPassenger.review_rating} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Статус:</span>
                      <Badge
                        variant={
                          selectedPassenger.is_online ? "default" : "secondary"
                        }
                      >
                        {selectedPassenger.is_online ? "Онлайн" : "Офлайн"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Информация об аккаунте
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">ID пользователя:</span>
                      <span>#{selectedPassenger.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Роль:</span>
                      <Badge variant="outline">{selectedPassenger.role}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Дата регистрации:</span>
                      <span>
                        {new Date(
                          selectedPassenger.created_at
                        ).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPassengerModal(false)}
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
