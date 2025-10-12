import { IRetrieveDataType } from "../types/enums/dashboard";
import apiClient from "./config";

// Fetch static statistics (forms, users, etc.)
export const fetchStaticStats = async (): Promise<any | null> => {
  try {
    const response = await apiClient.get("/dashboard/get-static-stats");
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch static stats:", error);
    throw error;
  }
};

// Fetch monthly form statistics (created or deleted)
export const fetchMonthlyFormsStats = async (
  year: number = new Date().getUTCFullYear(),
  operation: IRetrieveDataType = IRetrieveDataType.CREATED,
): Promise<any[] | null> => {
  try {
    const response = await apiClient.get("/dashboard/get-forms-by-month", {
      params: { year, operation },
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch monthly forms stats:", error);
    throw error;
  }
};

// Fetch Mirage users by date range
export const fetchUnitsByRange = async (range: {
  from: string | null;
  to: string | null;
}): Promise<any[] | null> => {
  try {
    const response = await apiClient.get("/dashboard/get-units-by-range-date", {
      params: { from: range.from, to: range.to },
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch units by range:", error);
    throw error;
  }
};
