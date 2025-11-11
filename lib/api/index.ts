export { usersApi } from "./users";
export { listingsApi } from "./listings";
export { complaintsApi } from "./complaints";
export { createCategoriesApi } from "./categories";
export { taxiAdminApi } from "./taxi";
export { authApi } from "./auth";
export { courierAdminApi } from "./courier";
// Legacy compatibility
import { UsersApiClient } from "./users";
import { ListingsApiClient } from "./listings";
import { ComplaintsApiClient } from "./complaints";
import { CategoriesApiClient } from "./categories";
import { TaxiAdminApi } from "./taxi";
import { AuthApiClient } from "./auth";
import { BaseApiClient } from "./base";

class LegacyApiClient extends BaseApiClient {
  private usersClient = new UsersApiClient();
  private listingsClient = new ListingsApiClient();
  private complaintsClient = new ComplaintsApiClient();
  private categoriesClient = new CategoriesApiClient('services');
  private taxiClient = new TaxiAdminApi();
  private authClient = new AuthApiClient();

  // Users methods
  async getUsers() { return this.usersClient.getUsers(); }
  async deleteUser(id: number) { return this.usersClient.deleteUser(id); }
  async getUserById(id: number) { return this.usersClient.getUserById(id); }

  // Listings methods
  async getServices() { return this.listingsClient.getServices(); }
  async deleteService(id: number) { return this.listingsClient.deleteService(id); }
  async getWork() { return this.listingsClient.getWork(); }
  async deleteWork(id: number) { return this.listingsClient.deleteWork(id); }
  async getRent() { return this.listingsClient.getRent(); }
  async deleteRent(id: number) { return this.listingsClient.deleteRent(id); }

  // Complaints methods
  async getComplaints() { return this.complaintsClient.getAllComplaints(); }
  async deleteComplaint(type: string, id: number) { return this.complaintsClient.deleteComplaint(type as any, id); }

  // Categories methods
  async getCategories() { return this.categoriesClient.getCategories(); }
  async createCategory(data: any) { return this.categoriesClient.createCategory(data); }
  async updateCategory(id: number, data: any) { return this.categoriesClient.updateCategory(id, data); }
  async deleteCategory(id: number) { return this.categoriesClient.deleteCategory(id); }
  async createSubcategory(data: any) { return this.categoriesClient.createSubcategory(data); }
  async updateSubcategory(id: number, data: any) { return this.categoriesClient.updateSubcategory(id, data); }
  async deleteSubcategory(id: number) { return this.categoriesClient.deleteSubcategory(id); }

  // Taxi methods
  async getTaxiDrivers(limit: number = 100, offset: number = 0) { return this.taxiClient.getDrivers(limit, offset); }
  async banTaxiDriver(driverId: number, banned: boolean) { return this.taxiClient.banDriver(driverId, banned); }
  async approveTaxiDriver(driverId: number, status: "approved" | "rejected") { return this.taxiClient.approveDriver(driverId, status); }
  async getTaxiOrders(limit: number = 100, offset: number = 0) { return this.taxiClient.getTaxiOrders(limit, offset); }
  async getIntercityOrders(limit: number = 100, offset: number = 0) { return this.taxiClient.getIntercityOrders(limit, offset); }

  // Auth methods
  async signIn(phone: string, password: string) { return this.authClient.signIn(phone, password); }
  signOut() { this.authClient.signOut(); }
}

export const apiClient = new LegacyApiClient();