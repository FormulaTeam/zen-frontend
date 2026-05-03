import apiClient from "./config";
import { CustomFormField } from "../utils/interfaces";

/**
 * Retrieve all custom form fields.
 *
 * @returns A promise that resolves to an array of custom form fields.
 */
export const getFormFields = async (): Promise<CustomFormField[]> => {
  try {
    const response = await apiClient.get<CustomFormField[]>("/form-fields/get");
    return response?.data;
  } catch (error) {
    console.error("Failed to fetch form fields:", error);
    throw error;
  }
};

/**
 * Create a new custom form field.
 *
 * @param formField - The custom form field data to be created.
 * @returns A promise that resolves to the created custom form field.
 */
export const createFormField = async (formField: CustomFormField): Promise<CustomFormField> => {
  try {
    const response = await apiClient.post<CustomFormField>("/form-fields/create", formField);
    return response?.data;
  } catch (error) {
    console.error("Failed to create form field:", error);
    throw error;
  }
};

/**
 * Update an existing custom form field.
 *
 * @param id - The ID of the custom form field to update.
 * @param updatedData - The updated form field data.
 * @returns A promise that resolves to the updated custom form field.
 */
export const updateFormField = async (
  id: string,
  updatedData: Partial<CustomFormField>,
): Promise<CustomFormField> => {
  try {
    const response = await apiClient.patch<CustomFormField>(`/form-fields/edit/${id}`, {
      updatedData,
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to update form field:", error);
    throw error;
  }
};

/**
 * Delete a custom form field.
 *
 * @param id - The ID of the custom form field to delete.
 * @returns A promise that resolves when the form field is successfully deleted.
 */
export const deleteFormField = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/form-fields/delete/${id}`);
  } catch (error) {
    console.error("Failed to delete form field:", error);
    throw error;
  }
};
