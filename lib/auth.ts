import { API_CONFIG } from "@/lib/config/api"
import { BaseApiClient } from "./api/base"
import { AuthResponse } from "./api"

export class AuthApiClient extends BaseApiClient {
  async signIn(phone: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.SIGN_IN, {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      })

      // Сохраняем AccessToken в памяти клиента (для заголовков)
      this.setAccessToken(response.AccessToken)

      // Плюс сразу пишем оба токена в куки (7 дней)
      if (typeof window !== "undefined") {
        const expires = new Date()
        expires.setDate(expires.getDate() + 7)

        document.cookie = `accessToken=${response.AccessToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
        document.cookie = `refreshToken=${response.RefreshToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
      }

      return response
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          throw new Error("Неверный номер телефона или пароль")
        }
        if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
          throw new Error("Ошибка сервера. Попробуйте позже")
        }
        if (error.message.includes("Network") || error.message.includes("fetch")) {
          throw new Error("Ошибка подключения к серверу")
        }
      }
      throw error
    }
  }

  signOut() {
    // Чистим токены в куки
    if (typeof window !== "undefined") {
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    }
    this.clearAccessToken()
  }
}

export const authApi = new AuthApiClient()
