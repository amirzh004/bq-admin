// courier.ts
export interface Courier {
  id: number
  user_id: number
  first_name: string
  last_name: string
  middle_name?: string | null
  full_name?: string
  courier_photo?: string
  iin: string
  date_of_birth: string
  id_card_front?: string
  id_card_back?: string
  phone?: string
  rating?: number
  approval_status: "pending" | "approved" | "rejected"
  is_banned: boolean
  status?: "online" | "offline" | "busy" | "free"
  created_at: string
  updated_at: string
  balance?: number
}

export interface CouriersResponse {
  couriers: Courier[]
  limit: number
  offset: number
  total?: number
}

export interface CouriersStats {
  total_couriers: number
  pending_couriers: number
  active_couriers: number
  banned_couriers: number
  free_couriers: number
}

// Типы для заказов курьеров
export interface RoutePoint {
  address: string
  lat: number
  lon: number
  entrance?: string
  intercom?: string
  phone?: string
  floor?: string
  apt?: string
}

export interface CourierOrdersStats {
  total_orders: number
  active_orders: number
  completed_orders: number
  canceled_orders: number
}

export interface BanCourierRequest {
  ban: boolean
}

export interface ApprovalCourierRequest {
  status: "approved" | "rejected" | "pending"
}

export interface CourierOrder {
  id: number
  sender_id: number
  courier_id?: number | null
  distance_m: number
  eta_s: number
  recommended_price: number
  client_price: number
  payment_method: "cash" | "online" | "card"
  status: 
    | "new"
    | "searching"
    | "offered"
    | "assigned"
    | "courier_arrived"
    | "pickup_started"
    | "pickup_done"
    | "delivery_started"
    | "delivered"
    | "closed"
    | "completed"
    | "canceled"
    | "canceled_by_sender"
    | "canceled_by_courier"
    | "canceled_no_show"
  comment?: string | null
  created_at: string
  updated_at: string
  completed_at?: string | null
  route_points: RoutePoint[]
  courier?: Courier
  sender?: {
    id: number
    name: string
    phone: string
    email: string
  }
}

export interface CourierOrdersResponse {
  orders: CourierOrder[]
  limit: number
  offset: number
  total?: number
}