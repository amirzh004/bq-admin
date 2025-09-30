import { API_CONFIG } from "@/lib/config/api";
import { getAuthToken, getRefreshToken, refreshToken, logout } from "./auth";
import { cookieOperations, isBrowser } from "./cookie-utils";

export class BaseApiClient {
  protected accessToken: string | null = null;

  constructor() {
    this.accessToken = getAuthToken();
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Для FormData не устанавливаем Content-Type автоматически
    const headers: HeadersInit = {};
    
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const refreshTokenValue = getRefreshToken();
    if (refreshTokenValue) {
      headers['X-Refresh-Token'] = refreshTokenValue;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401 && refreshTokenValue) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Update access token after refresh
          this.accessToken = getAuthToken();
          return this.request<T>(endpoint, options);
        } else {
          logout();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      // Если ответ пустой (например, при DELETE), возвращаем undefined
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
      }

      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  protected async put<T>(endpoint: string, data: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  protected async patch<T>(endpoint: string, data: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  protected async delete(endpoint: string): Promise<void> {
    await this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
    if (isBrowser()) {
      cookieOperations.set('Authorization', token, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
  }

  public clearAccessToken() {
    this.accessToken = null;
    if (isBrowser()) {
      cookieOperations.remove('Authorization');
    }
  }

  // Вспомогательный метод для загрузки файлов
  protected async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  // Вспомогательный метод для скачивания файлов
  protected async downloadFile(endpoint: string): Promise<Blob> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers: HeadersInit = {};

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const refreshTokenValue = getRefreshToken();
    if (refreshTokenValue) {
      headers['X-Refresh-Token'] = refreshTokenValue;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    return response.blob();
  }
}