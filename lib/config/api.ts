export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? "https://api.barlyqqyzmet.kz" 
    : "",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  COOKIE_NAMES: {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    ADMIN_SESSION: "admin-session",
  },
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: "/user/sign_in",
    },
    USERS: {
      GET_ALL: "/user",
      DELETE: "/user",
    },
    ADMIN: {
      SERVICES: {
        GET_ALL: "/admin/service/get",
        DELETE: "/service",
      },
      SERVICES_AD: {
        GET_ALL: "/admin/service_ad/get",
        DELETE: "/ad",
      },
      WORK: {
        GET_ALL: "/admin/work/get",
        DELETE: "/work",
      },
      WORK_AD: {
        GET_ALL: "/admin/work_ad/get",
        DELETE: "/work_ad",
      },
      RENT: {
        GET_ALL: "/admin/rent/get",
        DELETE: "/rent",
      },
      RENT_AD: {
        GET_ALL: "/admin/rent_ad/get",
        DELETE: "/rent_ad",
      },
      TAXI: {
        DRIVERS: "/api/v1/admin/taxi/drivers",
        ORDERS: "/api/v1/admin/taxi/orders",
        INTERCITY_ORDERS: "/api/v1/admin/taxi/intercity/orders",
        BAN_DRIVER: (driverId: number) => `/api/v1/admin/taxi/drivers/${driverId}/ban`,
        APPROVE_DRIVER: (driverId: number) => `/api/v1/admin/taxi/drivers/${driverId}/approval`,
      },
    },
    COMPLAINTS: {
      GET_ALL: "/complaints",
      GET_AD: "/ad_complaints",
      GET_WORK: "/work_complaints", 
      GET_WORK_AD: "/work_ad_complaints",
      GET_RENT: "/rent_complaints",
      GET_RENT_AD: "/rent_ad_complaints",
      DELETE: "/complaints",
      DELETE_AD: "/ad_complaints",
      DELETE_WORK: "/work_complaints",
      DELETE_WORK_AD: "/work_ad_complaints", 
      DELETE_RENT: "/rent_complaints",
      DELETE_RENT_AD: "/rent_ad_complaints",
    },
  },
} as const