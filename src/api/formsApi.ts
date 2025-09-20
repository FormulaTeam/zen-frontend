import apiClient from "./config";
import { NewForm, Form, Filter, MetroReturnedData, User } from "../utils/interfaces";
import { UserData } from "../types/interfaces/forms.types";

/**
 * Fetch all forms with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying forms.
 * @returns A promise that resolves to an array of forms.
 */
export const getForms = async (filter?: Filter): Promise<Form[]> => {
  const params = {
    query: filter?.query ? filter.query : undefined,
    sortBy: filter?.sortBy,
    orderBy: filter?.orderBy,
    pageSize: filter?.pageSize,
    pageNumber: filter?.pageNumber,
  };
  try {
    const response = await apiClient.post<Form>("/forms/get-forms", params, {
      signal: filter?.signal, // pass a signal if attached to the filter
    });
    if (!Array.isArray(response?.data)) {
      console.log("response:", response, "type: ", typeof response);
      console.log("response?.data:", response?.data, "type: ", typeof response?.data);
      return [];
    }
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    throw error;
  }
};

export const getFormById = async (formId?: number): Promise<Form | null> => {
  let filter = {
    query: {
      id: formId,
    },
  };
  let forms = await getForms(filter);
  return forms && forms[0] ? forms[0] : null;
};
/**
 * Create a new form.
 *
 * @param form - The new form data.
 * @returns A promise that resolves to the created form.
 */
export const createForm = async (form: NewForm): Promise<Form> => {
  try {
    const response = await apiClient.post<Form>("/forms/create", form);
    return response?.data;
  } catch (error) {
    console.error("Failed to create form:", error);
    throw error;
  }
};

/**
 * Update an existing form.
 *
 * @param id - The ID of the form to update.
 * @param form - The updated form data.
 * @returns A promise that resolves to the updated form.
 */
export const updateForm = async (
  id: number,
  form: Partial<Form>,
  isUpdateMetro?: boolean,
): Promise<Form> => {
  try {
    const response = await apiClient.put<Form>(`/forms/edit/${id}`, {
      formData: form,
      isUpdateMetro: isUpdateMetro,
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to update form:", error);
    throw error;
  }
};

/**
 * restores an deleted form.
 *
 * @param id - The ID of the form to update.
 * @returns A promise that resolves to the updated form.
 */
export const restoreForm = async (id: number): Promise<Form> => {
  try {
    const response = await apiClient.put<Form>(`/forms/restore/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to update form:", error);
    throw error;
  }
};

/**
 * Update an existing form with given users.
 *
 * @param id - The ID of the form to update.
 * @param usersForShare - The users to share the form with.
 * @returns A promise that resolves to the updated form.
 */
export const shareForm = async (id: number, usersForShare: User[]): Promise<Form> => {
  try {
    const response = await apiClient.put<Form>(`/forms/share/${id}`, usersForShare);
    return response?.data;
  } catch (error) {
    console.error("Failed to share form:", error);
    throw error;
  }
};

/**
 * Update an existing form with given users.
 *
 * @param id - The ID of the form to update.
 * @param metroObj - The metroObj to update form with.
 * @returns A promise that resolves to the updated form.
 */
export const updateMetroLbsInForm = async (id: number, metroObj: any): Promise<Form> => {
  try {
    const response = await apiClient.put<Form>(`/forms/updateMetroLbs/${id}`, metroObj);
    return response?.data;
  } catch (error) {
    console.error("Failed to update metro labels in form:", error);
    throw error;
  }
};

/**
 * Push the responses of a specific form to Metro.
 *
 * @param id - The ID of the form to send its responses to metro.
 * @returns A promise that resolves to the updated form.
 */
export const sendToMetroFormResponses = async (id: number): Promise<MetroReturnedData> => {
  try {
    const response = await apiClient.put<MetroReturnedData>(`/sync/send-responses/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to send form and its responses to Metro:", error);
    throw error;
  }
};

/**
 * Delete a form.
 *
 * @param id - The ID of the form to delete.
 * @returns A promise that resolves to the deleted form.
 */
export const deleteForm = async (id: number, userData: UserData): Promise<Form> => {
  const { upn, userName } = userData;
  try {
    const response = await apiClient.delete<Form>(
      `/forms/delete/${id}?upn=${upn}&userName=${userName}`,
    );

    return response?.data;
  } catch (error) {
    console.error("Failed to delete form:", error);
    throw error;
  }
};

/**
 * Upsert source to Metro.
 *
 * @param id - The ID of the form to upsert the source for.
 * @returns A promise that resolves to the upsert response data.
 */
export const upsertSourceToMetro = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.post<any>(`/sync/upsert-source/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to upsert source to Metro:", error);
    throw error;
  }
};

/**
 * Edit source in Metro.
 *
 * @param id - The ID of the form to edit the source for.
 * @returns A promise that resolves to the edit response data.
 */
export const editSourceToMetro = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.post<any>(`/sync/edit-source/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to edit source to Metro:", error);
    throw error;
  }
};
