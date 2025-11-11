// Export all API clients
export { usersApi } from "./users"
export { listingsApi } from "./listings"
export { complaintsApi } from "./complaints"
export { createCategoriesApi } from "./categories"
export { taxiAdminApi } from "./taxi"

// Export types
export * from "@/lib/types/models"

// Export config
export { API_CONFIG } from "@/lib/config/api"

// Legacy compatibility - single client instance
import { UsersApiClient } from "./users"
import { ListingsApiClient } from "./listings"
import { ComplaintsApiClient } from "./complaints"
import { BaseApiClient } from "./base"
import { CategoriesApiClient } from "./categories"
import { TaxiAdminApi } from "./taxi"

class LegacyApiClient extends BaseApiClient {
  private usersClient = new UsersApiClient()
  private listingsClient = new ListingsApiClient()
  private complaintsClient = new ComplaintsApiClient()
  private categoriesClient = new CategoriesApiClient('services')
  private taxiClient = new TaxiAdminApi()

  async getUsers() {
    return this.usersClient.getUsers()
  }

  async deleteUser(id: number) {
    return this.usersClient.deleteUser(id)
  }

  async getUserById(id: number) {
    return this.usersClient.getUserById(id)
  }

  // Services
  async getServices() {
    return this.listingsClient.getServices()
  }

  async deleteService(id: number) {
    return this.listingsClient.deleteService(id)
  }

  // Work
  async getWork() {
    return this.listingsClient.getWork()
  }

  async deleteWork(id: number) {
    return this.listingsClient.deleteWork(id)
  }

  // Rent
  async getRent() {
    return this.listingsClient.getRent()
  }

  async deleteRent(id: number) {
    return this.listingsClient.deleteRent(id)
  }

  // Complaints
  async getComplaints() {
    return this.complaintsClient.getAllComplaints()
  }

  async deleteComplaint(type: string, id: number) {
    return this.complaintsClient.deleteComplaint(type as any, id)
  }

  // Categories - default to services for legacy compatibility
  async getCategories() {
    return this.categoriesClient.getCategories()
  }

  async createCategory(data: any) {
    return this.categoriesClient.createCategory(data)
  }

  async updateCategory(id: number, data: any) {
    return this.categoriesClient.updateCategory(id, data)
  }

  async deleteCategory(id: number) {
    return this.categoriesClient.deleteCategory(id)
  }

  // Subcategories
  async createSubcategory(data: any) {
    return this.categoriesClient.createSubcategory(data)
  }

  async updateSubcategory(id: number, data: { category_id?: number; name?: string }) {
    // При редактировании отправляем только имя, category_id остается прежним
    const dataToSend = data.name ? { name: data.name } : data;
    return this.categoriesClient.updateSubcategory(id, dataToSend)
  }

  async deleteSubcategory(id: number) {
    return this.categoriesClient.deleteSubcategory(id)
  }

  // Taxi API methods
  async getTaxiDrivers(limit: number = 100, offset: number = 0) {
    return this.taxiClient.getDrivers(limit, offset)
  }

  async banTaxiDriver(driverId: number, banned: boolean) {
    return this.taxiClient.banDriver(driverId, banned)
  }

  async approveTaxiDriver(driverId: number, status: "approved" | "rejected") {
    return this.taxiClient.approveDriver(driverId, status)
  }

  async getTaxiOrders(limit: number = 100, offset: number = 0) {
    return this.taxiClient.getTaxiOrders(limit, offset)
  }

  async getIntercityOrders(limit: number = 100, offset: number = 0) {
    return this.taxiClient.getIntercityOrders(limit, offset)
  }


  // Auth methods
  async signIn(phone: string, password: string): Promise<{ AccessToken: string; RefreshToken: string }> {
    const response = await this.post<{ AccessToken: string; RefreshToken: string }>("/user/sign_in", {
      phone,
      password,
    })
    return response
  }

  async refreshToken(refreshToken: string): Promise<{ AccessToken: string }> {
    return this.post<{ AccessToken: string }>("/user/refresh", { refreshToken })
  }

  signOut(): void {
    this.clearAccessToken()
  }
}

export const apiClient = new LegacyApiClient()