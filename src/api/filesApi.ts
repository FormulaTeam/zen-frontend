import { decodeFileName } from "../utils/utils";
import apiClient from "./config";

// --- Types ---
export type StoredFile = {
  id?: string;
  responseId?: string;
  name: string;
  path: string;
  fileName?: string;
  mimeType?: string;
  sizeInBytes?: number;
  uploadedAt?: string;
};

export type LocalDisplayFile = {
  name: string;
  path?: string;
  file: File;
};

export type ResponseDisplayFile = StoredFile | LocalDisplayFile;

export type ResponseFileDto = {
  id: string;
  responseId: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
  uploadedAt: string;
};

// --- Helper Functions ---

const isLocalDisplayFile = (file: ResponseDisplayFile): file is LocalDisplayFile => {
  return "file" in file;
};

/**
 * Centralized utility to handle the DOM operations for triggering a file download.
 */
const triggerBrowserDownload = (data: Blob | File, rawFileName: string): void => {
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");

  link.href = url;
  link.download = decodeFileName(rawFileName);
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

// --- API Methods ---

export const uploadFile = async <T = unknown>(
  formId: number | string,
  responseId: string,
  file: File,
): Promise<T> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<T>(
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

export const downloadFile = async (
  formId: number | string,
  responseId: string,
  fileId: string,
  fileName: string,
): Promise<void> => {
  try {
    const response = await apiClient.get<Blob>(
      `/forms/${formId}/responses/${responseId}/files/${fileId}`,
      { responseType: "blob" },
    );

    triggerBrowserDownload(response.data, fileName);
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};

export const downloadFileFromResponse = async (
  file: ResponseDisplayFile,
  formId: string | number,
  responseId?: string,
): Promise<void> => {
  try {
    // Handle un-uploaded local files directly
    if (isLocalDisplayFile(file)) {
      triggerBrowserDownload(file.file, file.file.name);
      return;
    }

    const resolvedResponseId = responseId ?? file.responseId;
    const fileId = file.id ?? file.path;
    const fileName = file.name || file.fileName || fileId;

    if (!resolvedResponseId || !fileId) {
      // Fallback for legacy urls lacking responseId/fileId
      const response = await apiClient.get<Blob>(
        `/forms/${formId}/responses/legacy/files/legacy/${fileName}`,
        { responseType: "blob" },
      );

      triggerBrowserDownload(response.data, fileName);
      return;
    }

    await downloadFile(formId, resolvedResponseId, fileId, fileName);
  } catch (error) {
    console.error("Failed to download file from response:", error);
    throw error;
  }
};

export const toStoredFile = (file: ResponseFileDto): StoredFile => ({
  id: file.id,
  responseId: file.responseId,
  name: file.fileName,
  path: file.id,
  fileName: file.fileName,
  mimeType: file.mimeType,
  sizeInBytes: file.sizeInBytes,
  uploadedAt: file.uploadedAt,
});
