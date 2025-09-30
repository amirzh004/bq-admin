export interface User {
  id: number
  name: string
  surname: string
  middlename: string
  phone: string
  email: string
  password: string
  review_rating: number
  role?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: User
  images: any[]
  category_id: number
  subcategory_id: number
  description: string
  avg_rating: number
  top: "yes" | "no"
  liked: boolean
  status: "pending" | "active" | "archived"
  category_name: string
  subcategory_name: string
  main_category: string
}

export interface Work {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: User
  images: any[]
  category_id: number
  subcategory_id: number
  description: string
  top: "yes" | "no"
  status: "pending" | "active" | "archived"
  work_experience: string
  city_id: number
  schedule: string
  distance_work: "yes" | "no"
  payment_period: string
  latitude: number
  longitude: number
}

export interface Rent {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: User
  images: any[]
  category_id: number
  subcategory_id: number
  description: string
  avg_rating: number
  top: "yes" | "no"
  liked: boolean
  status: "pending" | "active" | "archived"
  rent_type: string
  deposit: number
  latitude: number
  longitude: number
}

// models.ts - добавить новые интерфейсы
export interface ComplaintBase {
  id: number
  user_id: number
  description: string
  created_at: string
  user: {
    name: string
    surname: string
    email: string
    city_id: number
    avatar_path: string
    review_rating: number
  }
}

export interface ServiceComplaint extends ComplaintBase {
  service_id: number
  type: 'service'
}

export interface AdComplaint extends ComplaintBase {
  ad_id: number
  type: 'ad'
}

export interface WorkComplaint extends ComplaintBase {
  work_id: number
  type: 'work'
}

export interface WorkAdComplaint extends ComplaintBase {
  work_ad_id: number
  type: 'work_ad'
}

export interface RentComplaint extends ComplaintBase {
  rent_id: number
  type: 'rent'
}

export interface RentAdComplaint extends ComplaintBase {
  rent_ad_id: number
  type: 'rent_ad'
}

export type Complaint = ServiceComplaint | AdComplaint | WorkComplaint | WorkAdComplaint | RentComplaint | RentAdComplaint

export type ComplaintType = 'service' | 'ad' | 'work' | 'work_ad' | 'rent' | 'rent_ad'
export type ComplaintCategory = 'service' | 'work' | 'rent'
export type ComplaintOfferType = 'provide' | 'search'

export interface AuthResponse {
  AccessToken: string
  RefreshToken: string
}

export type ListingType = "service" | "work" | "rent"
export type ListingStatus = "pending" | "active" | "archived"
export type TopStatus = "yes" | "no"

// Union type for all listing types
export type Listing = Service | Work | Rent

export interface Category {
  id: number
  name: string
  image_path?: string
  min_price: number
  created_at: string
  updated_at: string
  subcategories?: Subcategory[]
  type?: 'services' | 'work' | 'rent'
}

export interface Subcategory {
  id: number
  category_id: number
  name: string
  created_at: string
  updated_at: string
  type?: 'services' | 'work' | 'rent'
}

export interface CreateCategoryRequest {
  name: string
  image: File
}

export interface UpdateCategoryRequest {
  name?: string
  image?: File
}

export interface CreateSubcategoryRequest {
  category_id: number
  name: string
}

export interface UpdateSubcategoryRequest {
  category_id: number
  name: string
}