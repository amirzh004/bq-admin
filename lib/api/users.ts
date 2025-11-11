// users.ts - полностью обновленный файл
import { BaseApiClient } from "./base"
import { API_CONFIG } from "@/lib/config/api"
import type { User } from "@/lib/types/models"

export class UsersApiClient extends BaseApiClient {
  async getUsers(): Promise<User[]> {
    return this.get<User[]>(API_CONFIG.ENDPOINTS.USERS.GET_ALL)
  }

  async getUserById(id: number): Promise<User> {
    return this.get<User>(`${API_CONFIG.ENDPOINTS.USERS.GET_BY_ID}/${id}`)
  }

  async deleteUser(id: number): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${id}`)
  }
}

export const usersApi = new UsersApiClient()