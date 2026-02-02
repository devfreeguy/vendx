import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Custom API Error Class
export class ApiError extends Error {
  public statusCode?: number;
  public data?: any;

  constructor(message: string, statusCode?: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Axios Instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 15000, // 15 second timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent (important for JWT)
});

// Request Interceptor: useful for adding params or logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;

    // Handle standardized success response
    if (data && typeof data === "object" && "success" in data) {
      if (data.success) {
        // Return unwrapped data if present, otherwise return the whole object (e.g. for { success: true, message: "..." })
        return data.data !== undefined ? data.data : data;
      }
      // If success is false but status was 2xx (unexpected but possible), treat as error
      const message = data.error?.message || "Operation failed";
      throw new ApiError(message, response.status, data.error);
    }

    // Return raw data for non-standard responses
    return data;
  },
  (error: AxiosError<any>) => {
    let message = "An unexpected error occurred";
    const statusCode = error.response?.status;
    const data = error.response?.data;

    // Handle standardized error response
    if (data && data.error) {
      if (typeof data.error === "object" && data.error.message) {
        message = data.error.message;
      } else if (typeof data.error === "string") {
        message = data.error;
      }
    } else if (error.message) {
      message = error.message;
    }

    // Reject with our custom ApiError
    return Promise.reject(new ApiError(message, statusCode, data));
  },
);

export default api;
