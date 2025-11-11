export interface BaseUser {
  id: number
  name: string
  surname: string
  phone: string
  review_rating: number
  reviews_count: number
  avatar_path: string
}

export interface BaseMedia {
  name: string
  path: string
  type: string
}

export interface BaseListing {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: BaseUser
  images: BaseMedia[] | null
  videos: BaseMedia[] | null
  category_id: number
  subcategory_id: number
  description: string
  avg_rating: number
  top: string
  liked: boolean
  is_responded: boolean
  status: "active" | "pending" | "inactive"
  category_name: string
  subcategory_name: string
  created_at: string
  updated_at: string
}

// Service types (предоставляю)
export interface Service extends BaseListing {
  main_category: string
}

// Service Ad types (ищу)
export interface ServiceAd extends BaseListing {
  // Service ads have same structure as services
}

// Work types (предоставляю)
export interface Work extends BaseListing {
  work_experience: string
  city_id: number
  city_name: string
  city_type: string
  schedule: string
  distance_work: "yes" | "no"
  payment_period: string
  latitude: string
  longitude: string
}

// Work Ad types (ищу)
export interface WorkAd extends BaseListing {
  work_experience: string
  city_id: number
  city_name: string
  city_type: string
  schedule: string
  distance_work: "yes" | "no"
  payment_period: string
  latitude: string
  longitude: string
}

// Rent types (предоставляю)
export interface Rent extends BaseListing {
  rent_type: string
  deposit: string
  latitude: string
  longitude: string
}

// Rent Ad types (ищу)
export interface RentAd extends BaseListing {
  rent_type: string
  deposit: string
  latitude: string
  longitude: string
}

// API Response types
export interface ServicesResponse {
  services: Service[]
  min_price: number
  max_price: number
}

export interface ServiceAdsResponse {
  ads: ServiceAd[]
  min_price: number
  max_price: number
}

export interface WorkResponse {
  works: Work[]
  min_price: number
  max_price: number
}

export interface WorkAdsResponse {
  works_ad: WorkAd[]
  min_price: number
  max_price: number
}

export interface RentResponse {
  rents: Rent[]
  min_price: number
  max_price: number
}

export interface RentAdsResponse {
  rents_ad: RentAd[]
  min_price: number
  max_price: number
}

// Combined listing type for unified display
export type UnifiedListing = (Service | ServiceAd | Work | WorkAd | Rent | RentAd) & {
  listingType: "service" | "ad" | "work" | "work_ad" | "rent" | "rent_ad"
  category: "services" | "work" | "rent"
  variant: "provide" | "seek" // предоставляю / ищу
}

export interface AllListingsResponse {
  services: Service[]
  serviceAds: ServiceAd[]
  works: Work[]
  workAds: WorkAd[]
  rents: Rent[]
  rentAds: RentAd[]
  unified: UnifiedListing[]
  totalCount: number
  priceRange: {
    min: number
    max: number
  }
}
