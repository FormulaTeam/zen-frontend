import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  FC
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
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(({ user }: { user: User }) => {
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, login, roles: [] }}>
      {children}
    </AuthContext.Provider>
  );
};
