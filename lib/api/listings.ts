import { BaseApiClient } from "./base"

// Локальные интерфейсы
interface BaseUser {
  id: number
  name: string
  surname: string
  phone: string
  review_rating: number
  reviews_count: number
  avatar_path: string
}

interface BaseMedia {
  name: string
  path: string
  type: string
}

interface BaseListing {
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

interface Service extends BaseListing {
  main_category: string
}

interface ServiceAd extends BaseListing {}

interface Work extends BaseListing {
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

interface WorkAd extends BaseListing {
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

interface Rent extends BaseListing {
  rent_type: string
  deposit: string
  latitude: string
  longitude: string
}

interface RentAd extends BaseListing {
  rent_type: string
  deposit: string
  latitude: string
  longitude: string
}

interface ServicesResponse {
  services: Service[]
  min_price: number
  max_price: number
}

interface ServiceAdsResponse {
  ads: ServiceAd[]
  min_price: number
  max_price: number
}

interface WorkResponse {
  works: Work[]
  min_price: number
  max_price: number
}

interface WorkAdsResponse {
  works_ad: WorkAd[]
  min_price: number
  max_price: number
}

interface RentResponse {
  rents: Rent[]
  min_price: number
  max_price: number
}

interface RentAdsResponse {
  rents_ad: RentAd[]
  min_price: number
  max_price: number
}

type UnifiedListing = (Service | ServiceAd | Work | WorkAd | Rent | RentAd) & {
  listingType: "service" | "service_ad" | "work" | "work_ad" | "rent" | "rent_ad"
  category: "services" | "work" | "rent"
  variant: "provide" | "seek"
}

interface AllListingsResponse {
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

export class ListingsApiClient extends BaseApiClient {
  // Services (предоставляю)
  async getServices(): Promise<ServicesResponse> {
    return this.get<ServicesResponse>("/admin/service/get")
  }

  async deleteService(id: number): Promise<void> {
    await this.delete(`/service/${id}`)
  }

  // Service Ads (ищу)
  async getServiceAds(): Promise<ServiceAdsResponse> {
    return this.get<ServiceAdsResponse>("/admin/service_ad/get")
  }

  async deleteServiceAd(id: number): Promise<void> {
    await this.delete(`/ad/${id}`)
  }

  // Work (предоставляю)
  async getWork(): Promise<WorkResponse> {
    return this.get<WorkResponse>("/admin/work/get")
  }

  async deleteWork(id: number): Promise<void> {
    await this.delete(`/work/${id}`)
  }

  // Work Ads (ищу)
  async getWorkAds(): Promise<WorkAdsResponse> {
    return this.get<WorkAdsResponse>("/admin/work_ad/get")
  }

  async deleteWorkAd(id: number): Promise<void> {
    await this.delete(`/work_ad/${id}`)
  }

  // Rent (предоставляю)
  async getRent(): Promise<RentResponse> {
    return this.get<RentResponse>("/admin/rent/get")
  }

  async deleteRent(id: number): Promise<void> {
    await this.delete(`/rent/${id}`)
  }

  // Rent Ads (ищу)
  async getRentAds(): Promise<RentAdsResponse> {
    return this.get<RentAdsResponse>("/admin/rent_ad/get")
  }

  async deleteRentAd(id: number): Promise<void> {
    await this.delete(`/rent_ad/${id}`)
  }

  async getAllListings(): Promise<AllListingsResponse> {
    try {
      const [servicesResponse, serviceAdsResponse, workResponse, workAdsResponse, rentResponse, rentAdsResponse] =
        await Promise.all([
          this.getServices().catch(() => ({ services: [] })),
          this.getServiceAds().catch(() => ({ ads: [] })),
          this.getWork().catch(() => ({ works: [] })),
          this.getWorkAds().catch(() => ({ works_ad: [] })),
          this.getRent().catch(() => ({ rents: [] })),
          this.getRentAds().catch(() => ({ rents_ad: [] })),
        ])

      // Extract arrays from responses
      const services = servicesResponse.services || []
      const serviceAds = serviceAdsResponse.ads || []
      const works = workResponse.works || []
      const workAds = workAdsResponse.works_ad || []
      const rents = rentResponse.rents || []
      const rentAds = rentAdsResponse.rents_ad || []

      // Create unified listings with proper categorization
      const unified: UnifiedListing[] = [
        ...services.map((item) => ({
          ...item,
          listingType: "service" as const,
          category: "services" as const,
          variant: "provide" as const,
          author: item.user?.name || "Неизвестно",
          authorId: item.user_id,
        })),
        ...serviceAds.map((item) => ({
          ...item,
          listingType: "service_ad" as const,
          category: "services" as const,
          variant: "seek" as const,
          author: item.user?.name || "Неизвестно",
          authorId: item.user_id,
        })),
        ...works.map((item) => ({
          ...item,
          listingType: "work" as const,
          category: "work" as const,
          variant: "provide" as const,
          author: item.user?.name || "Неизвестно",
          authorId: item.user_id,
        })),
        ...workAds.map((item) => ({
          ...item,
          listingType: "work_ad" as const,
          category: "work" as const,
          variant: "seek" as const,
          author: item.user?.name || "Неизвестно",
          authorId: item.user_id,
        })),
        ...rents.map((item) => ({
          ...item,
          listingType: "rent" as const,
          category: "rent" as const,
          variant: "provide" as const,
          author: item.user?.name || "Неизвестно",
          authorId: item.user_id,
        })),
        ...rentAds.map((item) => ({
          ...item,
          listingType: "rent_ad" as const,
          category: "rent" as const,
          variant: "seek" as const,
          author: item.user?.name || "Неизвестно",
          authorId: item.user_id,
        })),
      ]

      // Calculate price range
      const allPrices = unified.map((item) => item.price).filter((price) => price > 0)
      const priceRange = {
        min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
        max: allPrices.length > 0 ? Math.max(...allPrices) : 0,
      }

      return {
        services,
        serviceAds,
        works,
        workAds,
        rents,
        rentAds,
        unified,
        totalCount: unified.length,
        priceRange,
      }
    } catch (error) {
      console.error('Error fetching all listings:', error)
      // Return empty response on error
      return {
        services: [],
        serviceAds: [],
        works: [],
        workAds: [],
        rents: [],
        rentAds: [],
        unified: [],
        totalCount: 0,
        priceRange: { min: 0, max: 0 },
      }
    }
  }

  async deleteListing(id: number, listingType: UnifiedListing["listingType"]): Promise<void> {
    switch (listingType) {
      case "service":
        return this.deleteService(id)
      case "service_ad":
        return this.deleteServiceAd(id)
      case "work":
        return this.deleteWork(id)
      case "work_ad":
        return this.deleteWorkAd(id)
      case "rent":
        return this.deleteRent(id)
      case "rent_ad":
        return this.deleteRentAd(id)
      default:
        throw new Error(`Unknown listing type: ${listingType}`)
    }
  }
}

export const listingsApi = new ListingsApiClient()