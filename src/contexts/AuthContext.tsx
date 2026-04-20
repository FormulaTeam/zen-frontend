import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  FC,
  useEffect
} from "react";
import { Role } from "../utils/interfaces";

export interface User {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  upn?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: ({ user }: { user: User }) => void;
  logout: () => void;
  roles: Role[];
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
 * roles is a static catalog derived from formula-gear's roleId constants.
 */
export const logoutAction = () => {
  localStorage.removeItem("user");
  if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/comeback")) {
    window.location.href = "/login";
  }
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          setUser(parsed);
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(({ user }: { user: User }) => {
    if (user && Object.keys(user).length > 0) {
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    logoutAction();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, roles: [], logout }}>
      {children}
    </AuthContext.Provider>
  );
};
