const API_BASE_URL = "https://api.barlyqqyzmet.kz"

export interface User {
  id: number
  name: string
  surname: string
  middlename: string
  phone: string
  email: string
  password: string
  review_rating: number
  role?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: User
  images: any[]
  category_id: number
  subcategory_id: number
  description: string
  avg_rating: number
  top: "yes" | "no"
  liked: boolean
  status: "pending" | "active" | "archived"
  category_name: string
  subcategory_name: string
  main_category: string
}

export interface Work {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: User
  images: any[]
  category_id: number
  subcategory_id: number
  description: string
  top: "yes" | "no"
  status: "pending" | "active" | "archived"
  work_experience: string
  city_id: number
  schedule: string
  distance_work: "yes" | "no"
  payment_period: string
  latitude: number
  longitude: number
}

export interface Rent {
  id: number
  name: string
  address: string
  price: number
  user_id: number
  user: User
  images: any[]
  category_id: number
  subcategory_id: number
  description: string
  avg_rating: number
  top: "yes" | "no"
  liked: boolean
  status: "pending" | "active" | "archived"
  rent_type: string
  deposit: number
  latitude: number
  longitude: number
}

export interface Complaint {
  id: number
  service_id: number
  user_id: number
  description: string
  created_at: string
}

export interface AuthResponse {
  AccessToken: string
  RefreshToken: string
}

class ApiClient {
  private accessToken: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = this.getCookieValue("accessToken")
    }
  }

  private getCookieValue(name: string): string | null {
    if (typeof window === "undefined") return null

    const cookies = document.cookie.split(";")
    const cookie = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`))
    return cookie ? cookie.split("=")[1] : null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = response.statusText || errorMessage
      }

      throw new Error(errorMessage)
    }

    return response.json()
  }

  // Auth
  async signIn(phone: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>("/user/sign_in", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      })

      this.accessToken = response.AccessToken

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
    this.accessToken = null
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/user")
  }

  async deleteUser(id: number): Promise<void> {
    await this.request(`/user/${id}`, { method: "DELETE" })
  }

  // Services
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>("/service/get")
  }

  async deleteService(id: number): Promise<void> {
    await this.request(`/service/${id}`, { method: "DELETE" })
  }

  // Work
  async getWork(): Promise<Work[]> {
    return this.request<Work[]>("/work/get")
  }

  async deleteWork(id: number): Promise<void> {
    await this.request(`/work/${id}`, { method: "DELETE" })
  }

  // Rent
  async getRent(): Promise<Rent[]> {
    return this.request<Rent[]>("/rent/get")
  }

  async deleteRent(id: number): Promise<void> {
    await this.request(`/rent/${id}`, { method: "DELETE" })
  }

  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>("/complaints")
  }

  async deleteComplaint(id: number): Promise<void> {
    await this.request(`/complaints/${id}`, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
