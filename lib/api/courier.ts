// courier.ts
import { BaseApiClient } from "./base"
import { 
  Courier,
  CouriersResponse,
  CouriersStats,
  CourierOrder,
  CourierOrdersResponse,
  CourierOrdersStats
} from '@/lib/types/courier'

export class CourierAdminApi extends BaseApiClient {
  
  // Список курьеров
  async getCouriers(limit: number = 20, offset: number = 0): Promise<CouriersResponse> {
    return this.get<CouriersResponse>(`/api/v1/admin/courier/couriers?limit=${limit}&offset=${offset}`)
  }

  // Статистика курьеров
  async getCouriersStats(): Promise<CouriersStats> {
    return this.get<CouriersStats>(`/api/v1/admin/courier/couriers/stats`)
  }

  // Бан курьера
  async banCourier(courierId: number, banned: boolean): Promise<Courier> {
    return this.post<Courier>(`/api/v1/admin/courier/couriers/${courierId}/ban`, { ban: banned })
  }

  // Подтверждение регистрации курьера
  async approveCourier(courierId: number, status: "approved" | "rejected" | "pending"): Promise<Courier> {
    return this.post<Courier>(`/api/v1/admin/courier/couriers/${courierId}/approval`, { status })
  }

  // История всех заказов курьеров
  async getCourierOrders(limit: number = 20, offset: number = 0): Promise<CourierOrdersResponse> {
    return this.get<CourierOrdersResponse>(`/api/v1/admin/courier/orders?limit=${limit}&offset=${offset}`)
  }

  // Статистика заказов курьеров
  async getCourierOrdersStats(): Promise<CourierOrdersStats> {
    return this.get<CourierOrdersStats>(`/api/v1/admin/courier/orders/stats`)
  }
}

export const courierAdminApi = new CourierAdminApi()