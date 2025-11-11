export const API_CONFIG = {
  BASE_URL: "https://api.barlyqqyzmet.kz",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: "/user/sign_in",
      REFRESH: "/user/refresh",
    },
    USERS: {
      GET_ALL: "/user",
      GET_BY_ID: "/user",
      DELETE: "/user",
    },
    ADMIN: {
      SERVICES: "/admin/service/get",
      SERVICES_AD: "/admin/ad/get",
      WORK: "/admin/work/get",
      WORK_AD: "/admin/work_ad/get",
      RENT: "/admin/rent/get",
      RENT_AD: "/admin/rent_ad/get",
      TAXI: {
        DRIVERS: "/api/v1/admin/taxi/drivers",
        ORDERS: "/api/v1/admin/taxi/orders",
        INTERCITY_ORDERS: "/api/v1/admin/taxi/intercity/orders",
        DRIVERS_STATS: "/api/v1/admin/taxi/drivers/stats",
        ORDERS_STATS: "/api/v1/admin/taxi/orders/stats",
        INTERCITY_STATS: "/api/v1/admin/taxi/intercity/orders/stats",
      },
    },
    LISTINGS: {
      SERVICE: "/service",
      AD: "/ad",
      WORK: "/work",
      WORK_AD: "/work_ad",
      RENT: "/rent",
      RENT_AD: "/rent_ad",
    },
    COMPLAINTS: {
      SERVICE: "/complaints",
      AD: "/ad_complaints",
      WORK: "/work_complaints",
      WORK_AD: "/work_ad_complaints",
      RENT: "/rent_complaints",
      RENT_AD: "/rent_ad_complaints",
    },
    CATEGORIES: {
      SERVICES: "/category",
      WORK: "/work_category",
      RENT: "/rent_category",
    },
    SUBCATEGORIES: {
      SERVICES: "/subcategory",
      WORK: "/work_subcategory",
      RENT: "/rent_subcategory",
    },
  },
} as const;