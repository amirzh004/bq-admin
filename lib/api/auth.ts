import { BaseApiClient } from "./base";
import { API_CONFIG } from "@/lib/config/api";
import { storageOperations, isBrowser } from "@/lib/utils/cookie-utils";
import { decodeJWT } from "@/lib/utils/auth-utils";

export interface AuthResponse {
  AccessToken: string;
  RefreshToken: string;
}

export class AuthApiClient extends BaseApiClient {
  async signIn(phone: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.SIGN_IN, {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });

      // Verify admin role before saving tokens
      const decodedToken = decodeJWT(response.AccessToken);
      if (!decodedToken || decodedToken.role !== "admin") {
        throw new Error("Доступ запрещен. Только администраторы могут войти в систему.");
      }

      this.setAccessToken(response.AccessToken);

      if (isBrowser()) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        document.cookie = `accessToken=${response.AccessToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
        storageOperations.set("RefreshToken", response.RefreshToken);
        document.cookie = `admin-session=authenticated; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          throw new Error("Неверный номер телефона или пароль");
        }
        if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
          throw new Error("Ошибка сервера. Попробуйте позже");
        }
        if (error.message.includes("Network") || error.message.includes("fetch")) {
          throw new Error("Ошибка подключения к серверу");
        }
      }
      throw error;
    }
  }

  signOut() {
    if (isBrowser()) {
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "admin-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      storageOperations.remove("RefreshToken");
    }
    this.clearAccessToken();
  }
}

export const authApi = new AuthApiClient();