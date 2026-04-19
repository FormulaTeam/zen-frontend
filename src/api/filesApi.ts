import { decodeFileName } from "../utils/utils";
import apiClient from "./config";

/**
 * Upload a file for a specific response.
 *
 * @param formId - The ID of the form.
 * @param responseId - The ID of the response.
 * @param file - The file to upload.
 * @returns A promise that resolves to the upload response.
 */
export const uploadFile = async (
  formId: number | string,
  responseId: string,
  file: File,
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `/forms/${formId}/responses/${responseId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

/**
 * Download a file for a specific response.
 *
 * @param formId - The ID of the form.
 * @param responseId - The ID of the response.
 * @param fileId - The ID of the file to download.
 * @param fileName - The name of the file for the downloaded blob.
 */
export const downloadFile = async (
  formId: number | string,
  responseId: string,
  fileId: string,
  fileName: string,
): Promise<void> => {
  try {
    const response = await apiClient.get(
      `/forms/${formId}/responses/${responseId}/files/${fileId}`,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", decodeFileName(fileName));
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};

// Legacy methods (kept for backward compatibility during transition)
// ============================================================

export const uploadFilesToS3 = async (files: any, formId: number): Promise<any> => {
  const formData = new FormData();
  files.newFiles.forEach((file) => formData.append("files", file));

  const response = await apiClient.post<{ files: any }>(
    `/responses/upload-file-to-s3?form_id=${formId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response?.data.files;
};

export const downloadFileFromResponse = async (file, formId?: string): Promise<void> => {
  try {
    const params = { fileName: file.name, form_id: formId };
    const response = await apiClient.get(`/responses/download-file`, {
      params,
      responseType: "blob",
    });

    const blob = response.data;
    const fileName = file.name;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = decodeFileName(fileName);
    link.click();
  } catch (error) {
    console.error("Failed to download file from response:", error);
    return Promise.reject(error);
  }
};

export const deleteFilesFromS3 = async (fileKeys: string[]): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/delete-files-from-s3", { fileKeys });
  return response?.data;
};
