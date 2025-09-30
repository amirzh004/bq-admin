import { BaseApiClient } from "./base"
import { API_CONFIG } from "@/lib/config/api"
import type {
  ServicesResponse,
  ServiceAdsResponse,
  WorkResponse,
  WorkAdsResponse,
  RentResponse,
  RentAdsResponse,
  UnifiedListing,
  AllListingsResponse,
} from "@/lib/types/listings"

export class ListingsApiClient extends BaseApiClient {
  // Services (предоставляю)
  async getServices(): Promise<ServicesResponse> {
    return this.get<ServicesResponse>(API_CONFIG.ENDPOINTS.ADMIN.SERVICES.GET_ALL)
  }

  async deleteService(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.ADMIN.SERVICES.DELETE}/${id}`)
  }

  // Service Ads (ищу)
  async getServiceAds(): Promise<ServiceAdsResponse> {
    return this.get<ServiceAdsResponse>(API_CONFIG.ENDPOINTS.ADMIN.SERVICES_AD.GET_ALL)
  }

  async deleteServiceAd(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.ADMIN.SERVICES_AD.DELETE}/${id}`)
  }

  // Work (предоставляю)
  async getWork(): Promise<WorkResponse> {
    return this.get<WorkResponse>(API_CONFIG.ENDPOINTS.ADMIN.WORK.GET_ALL)
  }

  async deleteWork(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.ADMIN.WORK.DELETE}/${id}`)
  }

  // Work Ads (ищу)
  async getWorkAds(): Promise<WorkAdsResponse> {
    return this.get<WorkAdsResponse>(API_CONFIG.ENDPOINTS.ADMIN.WORK_AD.GET_ALL)
  }

  async deleteWorkAd(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.ADMIN.WORK_AD.DELETE}/${id}`)
  }

  // Rent (предоставляю)
  async getRent(): Promise<RentResponse> {
    return this.get<RentResponse>(API_CONFIG.ENDPOINTS.ADMIN.RENT.GET_ALL)
  }

  async deleteRent(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.ADMIN.RENT.DELETE}/${id}`)
  }

  // Rent Ads (ищу)
  async getRentAds(): Promise<RentAdsResponse> {
    return this.get<RentAdsResponse>(API_CONFIG.ENDPOINTS.ADMIN.RENT_AD.GET_ALL)
  }

  async deleteRentAd(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.ADMIN.RENT_AD.DELETE}/${id}`)
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