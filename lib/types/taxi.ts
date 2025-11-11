export interface DriverInfo {
  id: number
  car_model: string
  full_name: string
  rating: number
  avatar_path: string
  profile_updated_at: string
}

export interface PassengerInfo {
  id: number
  full_name: string
  avatar_path: string
  phone: string
  rating: number
  profile_updated_at: string
}

export interface IntercityOrder {
  id: number
  passenger_id: number
  driver_id?: number
  from: string
  to: string
  trip_type: "solo" | "companions" | "parcel"
  comment?: string
  price: number
  contact_phone: string
  departure_date: string
  departure_time: string
  status: "open" | "closed"
  created_at: string
  updated_at: string
  closed_at?: string
  creator_role: "driver" | "passenger"
  driver?: DriverInfo
  passenger?: PassengerInfo
}

export interface IntercityOrdersResponse {
  orders: IntercityOrder[]
  limit: number
  offset: number
  total?: number
}

export interface Address {
  id: number
  seq: number
  lon: number
  lat: number
  address: string
}

export interface Passenger {
  id: number
  name: string
  surname: string
  middlename: string
  phone: string
  email: string
  city_id: number
  review_rating: number
  role: string
  avatar_path: string
  is_online: boolean
  created_at: string
  updated_at: string
}

export interface Driver {
  id: number
  user_id: number
  name: string
  surname: string
  middlename?: string
  status: "online" | "offline" | "busy" | "free" 
  approval_status: "pending" | "approved" | "rejected"
  is_banned: boolean
  car_number: string
  rating: number
  phone?: string
  car_model?: string
  car_color?: string
  iin: string
  tech_passport: string
  car_photo_front?: string
  car_photo_back?: string
  car_photo_left?: string
  car_photo_right?: string
  driver_photo: string
  id_card_front: string
  id_card_back?: string
  balance?: number
  updated_at?: string
}

export interface TaxiOrder {
  id: number
  passenger_id: number
  driver_id?: number
  from_lon: number
  from_lat: number
  to_lon: number
  to_lat: number
  distance_m: number
  eta_s: number
  recommended_price: number
  client_price: number
  payment_method: "cash" | "online" | "card"
  status: 
    | "created" 
    | "searching" 
    | "accepted" 
    | "assigned" 
    | "driver_at_pickup" 
    | "waiting_free" 
    | "waiting_paid" 
    | "in_progress" 
    | "at_last_point" 
    | "arrived" 
    | "picked_up" 
    | "completed" 
    | "paid" 
    | "closed" 
    | "not_found" 
    | "canceled" 
    | "canceled_by_passenger" 
    | "canceled_by_driver" 
    | "no_show"
  created_at: string
  updated_at: string
  completed_at?: string
  addresses: Address[]
  passenger: Passenger
  driver?: Driver
}

export interface DriversResponse {
  drivers: Driver[]
  limit: number
  offset: number
  total?: number
}

export interface TaxiOrdersResponse {
  orders: TaxiOrder[]
  limit: number
  offset: number
  total?: number
}


export interface BanDriverRequest {
  banned: boolean
}

export interface ApprovalDriverRequest {
  status: "approved" | "rejected" | "pending"
}

// Добавь в конец файла taxi.ts
export interface Courier {
  id: number
  user_id: number
  first_name: string
  last_name: string
  courier_photo?: string
  iin: string
  date_of_birth: string
  phone?: string
  rating?: number
  approval_status: "pending" | "approved" | "rejected"
  banned: boolean
  created_at: string
  updated_at: string
}

export interface CouriersResponse {
  couriers: Courier[]
}

export interface CouriersStats {
  total_couriers: number
  pending_couriers: number
  active_couriers: number
  banned_couriers: number
}