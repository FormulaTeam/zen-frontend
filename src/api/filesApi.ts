import { decodeFileName } from "../utils/utils";
import apiClient from "./config";

// Upload multiple files to S3
export const uploadFilesToS3 = async (files: any, formId: number): Promise<any> => {
  const formData = new FormData();
  files.newFiles.forEach((file) => formData.append("files", file));

  // console.log('Form Data Before BE : ' , formData)

  const response = await apiClient.post<{ files: any }>(
    `/responses/upload-file-to-s3?form_id=${formId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  // console.log('111111111 Response from BE : ' , response.data)
  return response?.data.files;
};

export const downloadFileFromResponse = async (file, formId?: string): Promise<void> => {
  try {
    const params = { fileName: file.name, form_id: formId };
    const response = await apiClient.get(`/responses/download-file`, {
      params,
      responseType: "blob",
    });

    // console.log("Response from download file:", response);
    const blob = response.data;
    const fileName = file.name;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    // decode the bytes to get the file name in hebrew characters
    link.download = decodeFileName(fileName);
    console.log(fileName);

    link.click(); // Trigger the download
  } catch (error) {
    console.error("Failed to download file from response:", error);
    return Promise.reject(error);
  }
};

// Delete files from S3
export const deleteFilesFromS3 = async (fileKeys: string[]): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/delete-files-from-s3", { fileKeys });

  return response?.data;
};
