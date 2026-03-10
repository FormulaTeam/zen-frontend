import axios from "axios";
import { StatusCodes } from "http-status-codes";

const apiClient = axios.create({
  baseURL: (window as any).RUNTIME_ENV
    ? (window as any).RUNTIME_ENV.REACT_APP_API_URL
    : "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage =
      window.location.pathname === "/login" || window.location.pathname === "/callback";
    if (error.response?.status === StatusCodes.UNAUTHORIZED && !isAuthPage) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;

