import { cookieOperations, storageOperations, isBrowser } from "./cookie-utils"

function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Failed to decode JWT:", error)
    return null
  }
}

export function checkAdminAuth(): boolean {
  if (!isBrowser()) return false

  const accessToken = cookieOperations.get("Authorization")
  const hasRefreshToken = !!storageOperations.get("RefreshToken")

  if (!accessToken || !hasRefreshToken) {
    return false
  }

  // Decode JWT token to check user role
  const decodedToken = decodeJWT(accessToken)
  if (!decodedToken) {
    console.error("Failed to decode access token")
    return false
  }

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000)
  if (decodedToken.exp && decodedToken.exp < currentTime) {
    console.log("Access token is expired")
    return false
  }

  // Check if user has admin role
  if (decodedToken.role !== "admin") {
    console.error("User is not an admin. Role:", decodedToken.role)
    return false
  }

  return true
}

export async function login(phone: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`

    const response = await fetch("https://api.barlyqqyzmet.kz/user/sign_in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: formattedPhone, password }),
    })

    // Проверим, есть ли тело ответа, даже если статус не 200
    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      return {
        success: false,
        error: "Неверный формат ответа от сервера",
      }
    }

    if (!response.ok) {
      // Если сервер вернул ошибку с сообщением
      const errorMessage = data.message || data.error || `Login failed: ${response.status}`
      console.error("Login error:", errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }

    // Проверяем наличие токенов в ответе
    if (data?.AccessToken && data?.RefreshToken) {
      // Decode and verify admin role before saving tokens
      const decodedToken = decodeJWT(data.AccessToken)
      if (!decodedToken) {
        return {
          success: false,
          error: "Ошибка обработки токена авторизации",
        }
      }

      // Check if user has admin role
      if (decodedToken.role !== "admin") {
        console.error("Access denied: User is not an admin. Role:", decodedToken.role)
        return {
          success: false,
          error: "Доступ запрещен. Только администраторы могут войти в систему.",
        }
      }

      // Check if token is not expired
      const currentTime = Math.floor(Date.now() / 1000)
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        return {
          success: false,
          error: "Токен авторизации истек",
        }
      }

      // Save tokens only if user is admin and token is valid
      if (isBrowser()) {
        cookieOperations.set("Authorization", data.AccessToken, {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        storageOperations.set("RefreshToken", data.RefreshToken)
        cookieOperations.set("admin-session", "authenticated", {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
      }

      console.log("Admin login successful. User ID:", decodedToken.user_id, "Role:", decodedToken.role)
      return { success: true }
    } else {
      console.error("Tokens missing in response:", data)
      return {
        success: false,
        error: "Сервер не вернул токены авторизации. Проверьте правильность данных.",
      }
    }
  } catch (error) {
    console.error("Login failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
    }
  }
}

export function logout() {
  if (!isBrowser()) return

  cookieOperations.remove("Authorization")
  cookieOperations.remove("admin-session")
  storageOperations.remove("RefreshToken")

  window.location.href = "/login"
}

export function getAuthToken(): string | null {
  return isBrowser() ? cookieOperations.get("Authorization") || null : null
}

export function getRefreshToken(): string | null {
  return isBrowser() ? storageOperations.get("RefreshToken") || null : null
}

export async function refreshToken(): Promise<boolean> {
  try {
    const refreshTokenValue = getRefreshToken()
    if (!refreshTokenValue) {
      console.error("No refresh token available")
      return false
    }

    const response = await fetch("https://api.barlyqqyzmet.kz/user/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    })

    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error("Failed to parse refresh response as JSON:", e)
      return false
    }

    if (!response.ok) {
      console.error("Token refresh failed:", data)
      return false
    }

    if (data?.AccessToken) {
      // Verify admin role in refreshed token
      const decodedToken = decodeJWT(data.AccessToken)
      if (!decodedToken || decodedToken.role !== "admin") {
        console.error("Refreshed token does not have admin role")
        logout() // Clear invalid session
        return false
      }

      if (isBrowser()) {
        cookieOperations.set("Authorization", data.AccessToken, {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
      }
      return true
    }

    console.error("AccessToken missing in refresh response:", data)
    return false
  } catch (error) {
    console.error("Token refresh failed:", error)
    return false
  }
}

export const formatPhoneNumber = (value: string) => {
  if (!value) return "+7"

  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "")

  // Ensure the number starts with 7
  const normalizedDigits = digits.startsWith("7") ? digits : `7${digits}`

  // Format the phone number
  let formatted = "+"

  if (normalizedDigits.length > 0) {
    formatted += normalizedDigits.substring(0, 1)
  }

  if (normalizedDigits.length > 1) {
    formatted += " " + normalizedDigits.substring(1, 4)
  }

  if (normalizedDigits.length > 4) {
    formatted += " " + normalizedDigits.substring(4, 7)
  }

  if (normalizedDigits.length > 7) {
    formatted += " " + normalizedDigits.substring(7, 9)
  }

  if (normalizedDigits.length > 9) {
    formatted += " " + normalizedDigits.substring(9, 11)
  }

  return formatted
}

export const parsePhoneNumber = (phone: string) => {
  return phone.replace(/\s/g, "")
}
