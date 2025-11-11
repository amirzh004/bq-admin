import { TaxiOrder, IntercityOrder, Address } from '@/lib/types/taxi'

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()} ₸`
}

export const formatDuration = (seconds: number): string => {
  const minutes = Math.ceil(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours} ч ${mins} мин` : `${mins} мин`
}

export const formatDistance = (meters: number): string => {
  const km = meters / 1000
  return `${km.toFixed(1)} км`
}


export const getOrderStatus = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    created: { label: "Создан", variant: "secondary" },
    searching: { label: "Поиск водителя", variant: "secondary" },
    accepted: { label: "Принят", variant: "default" },
    assigned: { label: "Назначен", variant: "default" },
    driver_at_pickup: { label: "Водитель на месте", variant: "default" },
    waiting_free: { label: "Ожидание бесплатное", variant: "secondary" },
    waiting_paid: { label: "Ожидание платное", variant: "secondary" },
    in_progress: { label: "В пути", variant: "default" },
    at_last_point: { label: "На последней точке", variant: "default" },
    arrived: { label: "Прибыл", variant: "default" },
    picked_up: { label: "Пассажир в машине", variant: "default" },
    completed: { label: "Завершен", variant: "outline" },
    paid: { label: "Оплачен", variant: "outline" },
    closed: { label: "Закрыт", variant: "outline" },
    not_found: { label: "Не найден", variant: "destructive" },
    canceled: { label: "Отменен", variant: "destructive" },
    canceled_by_passenger: { label: "Отменен пассажиром", variant: "destructive" },
    canceled_by_driver: { label: "Отменен водителем", variant: "destructive" },
    no_show: { label: "Пассажир не явился", variant: "destructive" }
  }

  return statusMap[status] || { label: status, variant: "secondary" }
}

export const getPaymentMethod = (method: string): { label: string; variant: "default" | "secondary" | "outline" } => {
  const methodMap = {
    cash: { label: "Наличные", variant: "secondary" as const },
    card: { label: "Карта", variant: "default" as const },
    online: { label: "Онлайн", variant: "default" as const }
  }

  return methodMap[method as keyof typeof methodMap] || { label: method, variant: "outline" as const }
}

export const getMainAddress = (addresses: Address[] | null | undefined): { from: string; to: string } => {
  if (!addresses || addresses.length === 0) {
    return { from: "Не указан", to: "Не указан" }
  }

  const fromAddress = addresses.find(addr => addr.seq === 0)
  const toAddress = addresses.find(addr => addr.seq === addresses.length - 1)

  return {
    from: fromAddress?.address || "Не указан",
    to: toAddress?.address || "Не указан"
  }
}


export const getDriverStatus = (status: string): { label: string; variant: "default" | "secondary" | "destructive" } => {
  const statusMap = {
    online: { label: "Онлайн", variant: "default" as const },
    offline: { label: "Офлайн", variant: "secondary" as const },
    busy: { label: "Занят", variant: "destructive" as const },
    free: { label: "Свободен", variant: "default" as const }
  }

  return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
}

export const getApprovalStatus = (status: string): { label: string; variant: "default" | "secondary" | "destructive" } => {
  const statusMap = {
    pending: { label: "На проверке", variant: "secondary" as const },
    approved: { label: "Подтвержден", variant: "default" as const },
    rejected: { label: "Отклонен", variant: "destructive" as const }
  }

  return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
}