import { IRetrieveDataType } from "../types/enums/dashboard";
import { CountResult } from "../types/interfaces/dashboard.types";
import apiClient from "./config";

const fetchStaticStats = async (): Promise<CountResult | null> => {
  try {
    const response = await apiClient.post("/dashboard/get-static-stats");
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch static stats:", error);
    throw error;
  }
}

/**
 * Fetch basic forms count stats (total & zero responses).
 */
const fetchFormsStats = async (
  year: number = new Date().getUTCFullYear(),
): Promise<CountResult | null> => {
  try {
    const response = await apiClient.post("/dashboard/get-forms-count", { year });
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch forms count stats:", error);
    throw error;
  }
};

/**
 * Fetch active and inactive forms stats.
 */
const fetchFormsActivityStats = async (): Promise<CountResult | null> => {
  try {
    const response = await apiClient.post("/dashboard/get-forms-activity");
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch forms activity stats:", error);
    throw error;
  }
};

/**
 * Fetch login logs and serialized Mirage users.
 */
const fetchLoginAndMirageStats = async (): Promise<CountResult | null> => {
  try {
    const response = await apiClient.post("/dashboard/get-login-stats");
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch login stats:", error);
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
    const response = await apiClient.post("/dashboard/get-forms-by-month", {
      year,
      operation,
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
    const response = await apiClient.post("/dashboard/get-units-by-range-date", { range });
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch units by range:", error);
    throw error;
  }
};

export {
  fetchStaticStats,
  fetchFormsStats,
  fetchFormsActivityStats,
  fetchLoginAndMirageStats,
  fetchMonthlyFormsStats,
  fetchUnitsByRange,
};
