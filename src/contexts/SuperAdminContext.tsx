import React, { createContext, useContext, useEffect, useState } from "react";
import { getIsSuperAdmin, useGetIsSuperAdmin } from "../api/usersApi";
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
  currentUserEmail?: string;
}

export const SuperAdminProvider: React.FC<SuperAdminProviderProps> = ({ children }) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  const { user } = useAuth();
  const { data: getIsSuperAdmin, isSuccess } = useGetIsSuperAdmin({ user });

  useEffect(() => {
    if (user && isSuccess) {
      setIsSuperAdmin(getIsSuperAdmin);
    }
  }, [user, isSuccess]);

  return (
    <SuperAdminContext.Provider value={{ isSuperAdmin }}>{children}</SuperAdminContext.Provider>
  );
};
