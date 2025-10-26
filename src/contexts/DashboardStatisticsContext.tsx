import React, { createContext, useContext } from "react";
import { useDashboardStatistics } from "../hooks/useDashboardStatistics";

type DashboardStatisticsContextType = ReturnType<typeof useDashboardStatistics> | null;
const DashboardStatisticsContext = createContext<DashboardStatisticsContextType>(null);

export const DashboardStatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useDashboardStatistics();
  return (
    <DashboardStatisticsContext.Provider value={value}>
      {children}
    </DashboardStatisticsContext.Provider>
  );
};

export const useDashboardStatisticsContext = () => {
  const context = useContext(DashboardStatisticsContext);
  if (!context) {
    throw new Error("useDashboardStatisticsContext must be used inside a DashboardStatisticsProvider");
  }
  return context;
};
