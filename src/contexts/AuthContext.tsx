import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { fetchUserInfo, useGetUserInfo } from "../api/authApi";
import { Role } from "../utils/interfaces";
import { useGetRoles } from "../api/rolesApi";
import { useSuperAdmin } from "./SuperAdminContext";
import { getIsSuperAdmin, useGetIsSuperAdmin } from "../api/usersApi";
export interface User {
  gender?: "male" | "female";
  firstName?: string;
  lastName?: string;
  displayName?: string;
  upn?: string;
}

interface AuthContextType {
  user: User | null;
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
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const { data: fetchedRoles, isSuccess: getRolesisSuccess } = useGetRoles({
    queryOptions: { enabled: !!user },
  });

  useEffect(() => {
    if (user && getRolesisSuccess) {
      setRoles(fetchedRoles);
    }
  }, [user, getRolesisSuccess, fetchedRoles]);

  const login = useCallback(({ user }: { user: User }) => {
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        roles,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
