// Убраны циклические импорты, добавлены локальные функции
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getAuthToken(): string | null {
  return isBrowser() ? getCookieValue("Authorization") || null : null
}

function getRefreshToken(): string | null {
  return isBrowser() ? localStorage.getItem("RefreshToken") || null : null
}

function getCookieValue(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : undefined;
  }
  return undefined;
}

function setCookie(name: string, value: string, options: { expires?: number; secure?: boolean; sameSite?: 'strict' | 'lax' } = {}): void {
  if (!isBrowser()) return;
  
  let cookieString = `${name}=${encodeURIComponent(value)}; path=/`;
  
  if (options.expires) {
    const date = new Date();
    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  if (options.secure && isProduction) {
    cookieString += '; secure';
  }
  
  if (options.sameSite) {
    const sameSiteValue = isProduction ? options.sameSite : 'lax';
    cookieString += `; samesite=${sameSiteValue}`;
  }
  
  document.cookie = cookieString;
}

function removeCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Локальная функция для рефреша токена
async function refreshToken(): Promise<boolean> {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      console.error("No refresh token available");
      return false;
    }

    const response = await fetch("https://api.barlyqqyzmet.kz/user/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Failed to parse refresh response as JSON:", e);
      return false;
    }

    if (!response.ok) {
      console.error("Token refresh failed:", data);
      return false;
    }

    if (data?.AccessToken) {
      setCookie("Authorization", data.AccessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return true;
    }

    console.error("AccessToken missing in refresh response:", data);
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

// Локальная функция для логаута
function logout() {
  if (!isBrowser()) return;

  removeCookie("Authorization");
  removeCookie("admin-session");
  localStorage.removeItem("RefreshToken");

  window.location.href = "/login";
}

export class BaseApiClient {
  protected accessToken: string | null = null;

  constructor() {
    this.accessToken = getAuthToken();
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `https://api.barlyqqyzmet.kz${endpoint}`;
    
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
      setCookie('Authorization', token, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
  }

  public clearAccessToken() {
    this.accessToken = null;
    if (isBrowser()) {
      removeCookie('Authorization');
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
    const url = `https://api.barlyqqyzmet.kz${endpoint}`;
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