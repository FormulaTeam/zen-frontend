import { User } from "../contexts/AuthContext";
import apiClient from "./config";

// Fetch the SSO authorization URL from the backend
export const getAuthUrl = async (): Promise<{ authUrl: string }> => {
  const response = await apiClient.get<{ authUrl: string }>("/auth/auth-url");
  return response?.data;
};

export const login = async (
  upn: string,
  password: string
): Promise<{ isAuth: boolean; user?: User; message: string }> => {
  const response = await apiClient.post<{ isAuth: boolean; user?: User; message: string }>(
    "/auth/login",
    {
      upn,
      password,
    }
  );
  return response?.data;
};

export const loginSSO = async () => {
  const response = await apiClient.get("/auth/comeback");
  return response?.data;
};

export const fetchUserInfo = async (token: string): Promise<User | null> => {
  try {
    const response = await apiClient.get<{ user: User }>("/auth/verify-token", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.user;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
};
