import { decodeFileName } from "../utils/utils";
import apiClient from "./config";

export type StoredFile = {
  name: string;
  path: string;
};

export type LocalDisplayFile = {
  name: string;
  file: File;
};

export type ResponseDisplayFile = StoredFile | LocalDisplayFile;

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

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};

const isLocalDisplayFile = (file: ResponseDisplayFile): file is LocalDisplayFile => {
  return "file" in file;
};

export const downloadFileFromResponse = async (
  file: ResponseDisplayFile,
  formId?: string,
): Promise<void> => {
  try {
    if (isLocalDisplayFile(file)) {
      const url = URL.createObjectURL(file.file);
      const link = document.createElement("a");

      link.href = url;
      link.download = decodeFileName(file.file.name);
      link.click();

      URL.revokeObjectURL(url);
      return;
    }

    const response = await apiClient.get(`/responses/download-file`, {
      params: {
        fileName: file.name,
        form_id: formId,
      },
      responseType: "blob",
    });

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = decodeFileName(file.name);
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download file from response:", error);
    return Promise.reject(error);
  }
};

export const deleteFilesFromS3 = async (fileKeys: string[]): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/delete-files-from-s3", { fileKeys });

  return response.data;
};
