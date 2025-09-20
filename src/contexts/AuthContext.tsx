import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { fetchUserInfo } from "../api/authApi";
import { Roles } from "../utils/interfaces";
import { getRoles } from "../api/rolesApi";

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days = 1) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export interface User {
  gender?: "male" | "female";
  firstName?: string;
  lastName?: string;
  displayName?: string;
  upn?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  loading: boolean;
  roles: Roles;
}

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth: Custom hook to access authentication context.
 * Throws an error if used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider: Provides authentication state and methods across the app.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Roles>([]);

  useEffect(() => {
    if (user) {
      getRoles()
        .then(setRoles)
        .catch(() => {});
    }
  }, [user]);

  const loadUser = useCallback(async () => {
    const token = getCookie("accessToken");
    if (!token) return;

    try {
      const userInfo = await fetchUserInfo(token);
      if (userInfo) setUser(userInfo);
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  }, []);

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, [loadUser]);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    setUser(user);
    setCookie("accessToken", accessToken);
    setCookie("refreshToken", refreshToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user: {
          displayName: "s9126860",
          firstName: "s9126860",
          lastName: "s9126860",
          upn: "s9126860@idfts.il",
        },
        login,
        loading,
        roles,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
