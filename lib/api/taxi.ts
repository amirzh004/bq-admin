// taxi.ts
import { BaseApiClient } from "./base"
import { 
  DriversResponse, 
  TaxiOrdersResponse, 
  IntercityOrdersResponse, 
  Driver
} from '@/lib/types/taxi'


export interface TaxiOrdersStats {
  total_orders: number
  active_orders: number
  completed_orders: number
  canceled_orders: number
}

export interface IntercityOrdersStats {
  total_orders: number
  active_orders: number
  completed_orders: number
  canceled_orders: number
}

export interface DriversStats {
  total_drivers: number
  online_drivers: number
  free_drivers: number
  pending_drivers: number
  banned_drivers: number
}

export class TaxiAdminApi extends BaseApiClient {
  
  // Список водителей
  async getDrivers(limit: number = 20, offset: number = 0): Promise<DriversResponse> {
    return this.get<DriversResponse>(`/api/v1/admin/taxi/drivers?limit=${limit}&offset=${offset}`)
  }

  // Статистика водителей
  async getDriversStats(): Promise<DriversStats> {
    return this.get<DriversStats>(`/api/v1/admin/taxi/drivers/stats`)
  }

  // Бан водителя
  async banDriver(driverId: number, banned: boolean): Promise<Driver> {
    return this.post<Driver>(`/api/v1/admin/taxi/drivers/${driverId}/ban`, { banned })
  }

  // Подтверждение регистрации водителя
  async approveDriver(driverId: number, status: "approved" | "rejected"): Promise<Driver> {
    return this.post<Driver>(`/api/v1/admin/taxi/drivers/${driverId}/approval`, { status })
  }

  // История всех заказов такси (внутри города)
  async getTaxiOrders(limit: number = 20, offset: number = 0): Promise<TaxiOrdersResponse> {
    return this.get<TaxiOrdersResponse>(`/api/v1/admin/taxi/orders?limit=${limit}&offset=${offset}`)
  }

  // Статистика заказов такси
  async getTaxiOrdersStats(): Promise<TaxiOrdersStats> {
    return this.get<TaxiOrdersStats>(`/api/v1/admin/taxi/orders/stats`)
  }

  // История межгородских заказов
  async getIntercityOrders(limit: number = 20, offset: number = 0): Promise<IntercityOrdersResponse> {
    return this.get<IntercityOrdersResponse>(`/api/v1/admin/taxi/intercity/orders?limit=${limit}&offset=${offset}`)
  }

  // Статистика межгородских заказов
  async getIntercityOrdersStats(): Promise<IntercityOrdersStats> {
    return this.get<IntercityOrdersStats>(`/api/v1/admin/taxi/intercity/orders/stats`)
  }
}

export const taxiAdminApi = new TaxiAdminApi()