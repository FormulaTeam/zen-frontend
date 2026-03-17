import React, { createContext, useContext, useEffect, useState } from "react";
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
  children: React.ReactNode;
}

export const SuperAdminProvider = ({ children }: SuperAdminProviderProps) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  const { user } = useAuth();
  const isSuperAdminData = useGetIsSuperAdmin();

  useEffect(() => {
    if (user) setIsSuperAdmin(isSuperAdminData);
  }, [user, isSuperAdminData]);

  return (
    <SuperAdminContext.Provider value={{ isSuperAdmin }}>{children}</SuperAdminContext.Provider>
  );
};
