import axios from "axios";

// Utility functions to manage cookies
const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  const value = match ? decodeURIComponent(match[2]) : null;
  console.log(`[COOKIE] Get ${name}: ${value ? `Found (length: ${value.length})` : "Not found"}`);
  return value;
};

const setCookie = (name: string, value: string, days = 1) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  console.log(`[COOKIE] Set ${name}: length ${value.length}, expires ${expires}`);
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
  console.log(`[COOKIE] Deleted ${name}`);
};

// Axios instance
const apiClient = axios.create({
  baseURL: (window as any).RUNTIME_ENV
    ? (window as any).RUNTIME_ENV.REACT_APP_API_URL
    : "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Allow cookies to be sent with requests
});

// Refresh token function
export const refreshToken = async () => {
  console.log("[REFRESH TOKEN] Starting token refresh process");
  try {
    const storedRefreshToken = getCookie("refreshToken");
    if (!storedRefreshToken) {
      console.error("[REFRESH TOKEN] No refresh token found in cookies");
      throw new Error("Refresh token is not found in cookies");
    }
    console.log("[REFRESH TOKEN] Found refresh token in cookies");

    const baseUrl = (window as any).RUNTIME_ENV?.REACT_APP_API_URL || "http://localhost:3000/api";
    console.log(`[REFRESH TOKEN] Using base URL: ${baseUrl}`);

    console.log("[REFRESH TOKEN] Making refresh token request to server");
    const response = await axios.get(`${baseUrl}/auth/refreshToken`, {
      headers: {
        Authorization: `Bearer ${storedRefreshToken}`,
      },
      // withCredentials: true // Uncomment if server sends cookies
    });

    const { accessToken, isValid } = response.data;
    console.log(
      `[REFRESH TOKEN] Server response - isValid: ${isValid}, accessToken length: ${
        accessToken?.length || 0
      }`,
    );

    // Store new token in cookies
    setCookie("accessToken", accessToken);
    console.log("[REFRESH TOKEN] New access token stored in cookies");

    return { accessToken, isValid };
  } catch (error: any) {
    console.error("[REFRESH TOKEN] Failed to refresh token:", error);
    if (error.response) {
      console.error("[REFRESH TOKEN] Server error response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }
    throw error;
  }
};

// Request interceptor to add authorization header
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      console.log(
        `[REQUEST INTERCEPTOR] Adding authorization header for ${config.method?.toUpperCase()} ${
          config.url
        }`,
      );
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.log(
        `[REQUEST INTERCEPTOR] No access token found for ${config.method?.toUpperCase()} ${
          config.url
        }`,
      );
    }
    return config;
  },
  (error) => {
    console.error("[REQUEST INTERCEPTOR] Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[RESPONSE INTERCEPTOR] Success ${
        response.status
      } for ${response.config.method?.toUpperCase()} ${response.config.url}`,
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(
      `[RESPONSE INTERCEPTOR] Error ${
        error.response?.status
      } for ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
    );

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[RESPONSE INTERCEPTOR] 401 detected, attempting token refresh");

      if (isRefreshing) {
        console.log("[RESPONSE INTERCEPTOR] Token refresh already in progress, queuing request");
        // If already refreshing, wait for the new token
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            console.log("[RESPONSE INTERCEPTOR] Token refreshed, retrying queued request");
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log("[RESPONSE INTERCEPTOR] Starting token refresh process");

      try {
        const { accessToken } = await refreshToken();
        isRefreshing = false;
        console.log("[RESPONSE INTERCEPTOR] Token refresh successful, notifying queued requests");
        onTokenRefreshed(accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        console.log("[RESPONSE INTERCEPTOR] Retrying original request with new token");
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error("[RESPONSE INTERCEPTOR] Token refresh failed:", refreshError);
        // Clear tokens and redirect to login
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
        console.log("[RESPONSE INTERCEPTOR] Cleared tokens, redirecting to login");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    console.log(
      `[RESPONSE INTERCEPTOR] Non-401 error or already retried, rejecting:`,
      error.message,
    );
    return Promise.reject(error);
  },
);

export default apiClient;
