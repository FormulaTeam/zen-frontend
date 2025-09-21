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
  console.log(`[COOKIE DEBUG] Looking for cookie: ${name}`);
  console.log(`[COOKIE DEBUG] All cookies: ${document.cookie}`);
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  const result = match ? decodeURIComponent(match[2]) : null;
  console.log(
    `[COOKIE DEBUG] Result for ${name}:`,
    result ? `Found (length: ${result.length})` : "Not found",
  );
  return result;
};

const setCookie = (name: string, value: string, days = 1) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  console.log(`[COOKIE DEBUG] Setting cookie: ${name} with value length: ${value.length}`);
  console.log(`[COOKIE DEBUG] Cookie string: ${cookieString}`);
  document.cookie = cookieString;

  // Verify the cookie was set
  setTimeout(() => {
    const verification = getCookie(name);
    console.log(
      `[COOKIE DEBUG] Verification - ${name} was ${verification ? "successfully set" : "NOT set"}`,
    );
  }, 100);
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

  // TEMPORARILY COMMENTED OUT FOR DEBUGGING
  // TODO: Remove this demo user logic completely for production
  /*
  useEffect(() => {
    const setUserDemo = async () => {
      setUser({
        displayName: "s9126860",
        firstName: "s9126860",
        lastName: "s9126860",
        upn: "s9126860@idfts.il",
      });
    };

    const timeoutId = setTimeout(setUserDemo, 100);

    return () => clearTimeout(timeoutId);
  }, []);
  */

  useEffect(() => {
    if (user) {
      getRoles()
        .then(setRoles)
        .catch(() => {});
    }
  }, [user]);

  const loadUser = useCallback(async () => {
    const token = getCookie("accessToken"); // this doesnt work returns null all the time
    console.log("Access Token:", token);
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
    console.log("[LOGIN DEBUG] Login function called with:", {
      user: user,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
    });

    setUser(user);
    setCookie("accessToken", accessToken);
    setCookie("refreshToken", refreshToken);

    console.log("[LOGIN DEBUG] User state set and cookies should be stored");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loading,
        roles,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
