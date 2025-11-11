import { API_CONFIG } from "@/lib/config/api";
import { cookieOperations, storageOperations, isBrowser } from "@/lib/utils/cookie-utils";
import { decodeJWT } from "@/lib/utils/auth-utils";

function getAuthToken(): string | null {
  return isBrowser() ? cookieOperations.get("Authorization") || null : null;
}

function getRefreshToken(): string | null {
  return isBrowser() ? storageOperations.get("RefreshToken") || null : null;
}

function setCookie(name: string, value: string, options: { expires?: number; secure?: boolean; sameSite?: 'strict' | 'lax' } = {}): void {
  if (!isBrowser()) return;
  cookieOperations.set(name, value, options);
}

function removeCookie(name: string): void {
  if (!isBrowser()) return;
  cookieOperations.remove(name);
}

async function refreshAuthToken(): Promise<boolean> {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      return false;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data?.AccessToken) {
      const decodedToken = decodeJWT(data.AccessToken);
      if (!decodedToken || decodedToken.role !== "admin") {
        return false;
      }

      setCookie("Authorization", data.AccessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

function logout() {
  if (!isBrowser()) return;

  removeCookie("Authorization");
  removeCookie("admin-session");
  storageOperations.remove("RefreshToken");

  window.location.href = "/login";
}

export class BaseApiClient {
  protected accessToken: string | null = null;

  constructor() {
    this.accessToken = getAuthToken();
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {};
    
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          this.accessToken = getAuthToken();
          return this.request<T>(endpoint, options);
        } else {
          logout();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

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
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  protected async delete(endpoint: string): Promise<void> {
    await this.request<void>(endpoint, { method: 'DELETE' });
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
    setCookie('Authorization', token, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  public clearAccessToken() {
    this.accessToken = null;
    removeCookie('Authorization');
  }
}