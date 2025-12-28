import { UseQueryResult } from "@tanstack/react-query";
import { IRetrieveDataType } from "../types/enums/dashboard";
import { CountResult, formsByMonth, IMirageUser } from "../types/interfaces/dashboard.types";
import { useFetch } from "../utils/useFetch";
import apiClient from "./config";

export const staticStats = (): UseQueryResult<CountResult | null> => {
  return useFetch<undefined, CountResult | null>({
    queryKey: () => ["static-stats"],
    endpoint: "/dashboard/get-static-stats",
  });
};

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

export const unitsByRange = (
  range: { from: string | null; to: string | null },
): UseQueryResult<IMirageUser[] | null> => {
  return useFetch<typeof range, IMirageUser[] | null>({
    queryKey: (params) => ["units-by-range", params?.from, params?.to],
    endpoint: "/dashboard/get-units-by-range-date",
    params: range,
  });
};
