import { IRetrieveDataType } from "../types/enums/dashboard";
import { CountResult } from "../types/interfaces/dashboard.types";
import apiClient from "./config";

const fetchStaticStats = async (): Promise<CountResult | null> => {
  try {
    const response = await apiClient.get("/dashboard/get-static-stats");
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch static stats:", error);
    throw error;
  }
};

/**
 * Fetch forms by month (created & deleted) based on operation.
 */
const fetchMonthlyFormsStats = async (
  year: number = new Date().getUTCFullYear(),
  operation: IRetrieveDataType = IRetrieveDataType.CREATED,
): Promise<CountResult | null> => {
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

/**
 * Fetch units (Mirage users) within a date range.
 */
const fetchUnitsByRange = async (range: {
  from: string | null;
  to: string | null;
}): Promise<CountResult | null> => {
  try {
    const response = await apiClient.get("/dashboard/get-units-by-range-date", {
      params: { range },
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch units by range:", error);
    throw error;
  }
};

export {
  fetchStaticStats,
  fetchMonthlyFormsStats,
  fetchUnitsByRange,
};
