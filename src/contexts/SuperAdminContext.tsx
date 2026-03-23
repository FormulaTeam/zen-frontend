import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { userType } from "formula-gear";
import { useGetIsSuperAdmin } from "../api/usersApi";
import { useAuth } from "./AuthContext";

interface SuperAdminContextType {
  isSuperAdmin: boolean | null;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
};

interface SuperAdminProviderProps {
  children: ReactNode;
}

export const SuperAdminProvider = ({ children }: SuperAdminProviderProps) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  const { user } = useAuth();
  const { data: isSuperAdminData } = useGetIsSuperAdmin();

  useEffect(() => {
    if (user && isSuperAdminData !== undefined) {
      setIsSuperAdmin(isSuperAdminData === userType.SuperAdmin);
    } else if (!user) {
      setIsSuperAdmin(null);
    }
  }, [user, isSuperAdminData]);

  return (
    <SuperAdminContext.Provider value={{ isSuperAdmin }}>{children}</SuperAdminContext.Provider>
  );
};
