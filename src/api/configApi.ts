import apiClient from "./config";
import { Config } from "../utils/interfaces";

/**
 * Fetch configuration value by key or all configuration values if no key is provided.
 *
 * @param key - Optional key of the configuration value to retrieve.
 * @returns A promise that resolves to the configuration value(s).
 */
export const getConfig = async (key?: string): Promise<Config> => {
  const params = key ? { key } : {};
  try {
    const response = await apiClient.get<Config>("/config/get", { params });
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch configuration:", error);
    throw error;
  }
};
