import { UseQueryResult } from "@tanstack/react-query";
import { IRetrieveDataType } from "../types/enums/dashboard";
import { CountResult, formsByMonth, IMirageUser } from "../types/interfaces/dashboard.types";
import { useFetch } from "../utils/useFetch";
import apiClient from "./config";

// Fetch static statistics (forms, users, etc.)
// export const fetchStaticStats = async (): Promise<CountResult | null> => {
//   try {
//     const response = await apiClient.get<CountResult>("/dashboard/get-static-stats");
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch static stats:", error);
//     throw error;
//   }
// };

export const staticStats = (): UseQueryResult<CountResult | null> => {
  return useFetch<undefined, CountResult | null>({
    queryKey: () => ["static-stats"],
    endpoint: "/dashboard/get-static-stats",
  });
};

// Fetch monthly form statistics (created or deleted)
// export const fetchMonthlyFormsStats = async (
//   year: number = new Date().getUTCFullYear(),
//   operation: IRetrieveDataType = IRetrieveDataType.CREATED,
// ): Promise<formsByMonth[] | null> => {
//   try {
//     const response = await apiClient.get<formsByMonth[]>("/dashboard/get-forms-by-month", {
//       params: { year, operation },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch monthly forms stats:", error);
//     throw error;
//   }
// };

export const monthlyFormsStats = (
  year: number = new Date().getUTCFullYear(),
  operation: IRetrieveDataType = IRetrieveDataType.CREATED,
): UseQueryResult<formsByMonth[] | null> => {
  return useFetch<{ year: number; operation: IRetrieveDataType }, formsByMonth[] | null>({
    queryKey: (params) => ["monthly-forms-stats", params?.year, params?.operation],
    endpoint: "/dashboard/get-forms-by-month",
    params: { year, operation },
  });
};

// Fetch Mirage users by date range
// export const fetchUnitsByRange = async (range: {
//   from: string | null;
//   to: string | null;
// }): Promise<IMirageUser[] | null> => {
//   try {
//     const response = await apiClient.get<IMirageUser[]>("/dashboard/get-units-by-range-date", {
//       params: { from: range.from, to: range.to },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Failed to fetch units by range:", error);
//     throw error;
//   }
// };

export const unitsByRange = (
  range: { from: string | null; to: string | null },
): UseQueryResult<IMirageUser[] | null> => {
  return useFetch<typeof range, IMirageUser[] | null>({
    queryKey: (params) => ["units-by-range", params?.from, params?.to],
    endpoint: "/dashboard/get-units-by-range-date",
    params: range,
  });
};
