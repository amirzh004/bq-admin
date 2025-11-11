export interface Courier {
  id: number
  user_id: number
  first_name: string
  last_name: string
  full_name?: string
  courier_photo?: string
  iin: string
  date_of_birth: string
  phone?: string
  rating?: number
  approval_status: "pending" | "approved" | "rejected"
  banned: boolean
  status?: "online" | "offline" | "busy" | "free"
  created_at: string
  updated_at: string
  balance?: number
}

export interface CouriersResponse {
  couriers: Courier[]
}

export interface CouriersStats {
  total_couriers: number
  pending_couriers: number
  active_couriers: number
  banned_couriers: number
  online_couriers: number
  free_couriers: number
}