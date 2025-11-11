// courier-utils.ts
import { RoutePoint } from "@/lib/types/courier";

export const getMainAddress = (routePoints: RoutePoint[]): { from: string; to: string } => {
  if (!routePoints || routePoints.length === 0) {
    return { from: "Не указано", to: "Не указано" };
  }
  
  const from = routePoints[0]?.address || "Не указано";
  const to = routePoints[routePoints.length - 1]?.address || "Не указано";
  
  return { from, to };
};

export const getOrderStatus = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    new: { label: "Новый", variant: "secondary" },
    searching: { label: "Поиск курьера", variant: "secondary" },
    offered: { label: "Предложен", variant: "outline" },
    assigned: { label: "Назначен", variant: "default" },
    courier_arrived: { label: "Курьер прибыл", variant: "default" },
    pickup_started: { label: "Забор начат", variant: "default" },
    pickup_done: { label: "Забор завершен", variant: "default" },
    delivery_started: { label: "Доставка начата", variant: "default" },
    delivered: { label: "Доставлен", variant: "default" },
    closed: { label: "Закрыт", variant: "outline" },
    completed: { label: "Завершен", variant: "default" },
    canceled: { label: "Отменен", variant: "destructive" },
    canceled_by_sender: { label: "Отменен отправителем", variant: "destructive" },
    canceled_by_courier: { label: "Отменен курьером", variant: "destructive" },
    canceled_no_show: { label: "Отменен (не явился)", variant: "destructive" },
  };

  return statusMap[status] || { label: status, variant: "outline" };
};

export const getPaymentMethod = (method: string) => {
  const methodMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    cash: { label: "Наличные", variant: "outline" },
    online: { label: "Онлайн", variant: "default" },
    card: { label: "Карта", variant: "secondary" },
  };

  return methodMap[method] || { label: method, variant: "outline" };
};

// Добавляем функцию getApprovalStatus
export const getApprovalStatus = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "На проверке", variant: "secondary" },
    approved: { label: "Подтвержден", variant: "default" },
    rejected: { label: "Отклонен", variant: "destructive" },
  };

  return statusMap[status] || { label: status, variant: "outline" };
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDistance = (distanceMeters: number): string => {
  if (distanceMeters < 1000) {
    return `${distanceMeters} м`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} км`;
};

export const formatDuration = (durationSeconds: number): string => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  return `${minutes} мин`;
};