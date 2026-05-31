import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

export interface StoredFile {
  name: string;
  path: string;
}

export interface FileFieldValue {
  files: StoredFile[];
}

export interface FileCellEditorValue {
  files: {
    newFiles: File[];
    attachedFiles: StoredFile[];
  };
  deletedFiles: StoredFile[];
}

interface FileCellEditorProps {
  value: FileFieldValue | FileCellEditorValue | null;
  onChange: (value: FileCellEditorValue, isValid: boolean) => void;
  isRequired?: boolean;
  errorMessage?: string;
}

const isStoredFile = (value: unknown): value is StoredFile => {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "path" in value &&
    typeof value.name === "string" &&
    typeof value.path === "string"
  );
};

const isDbFileFieldValue = (value: unknown): value is FileFieldValue => {
  return (
    typeof value === "object" &&
    value !== null &&
    "files" in value &&
    Array.isArray(value.files) &&
    value.files.every(isStoredFile)
  );
};

const isEditorFileValue = (value: unknown): value is FileCellEditorValue => {
  if (typeof value !== "object" || value === null || !("files" in value)) {
    return false;
  }

  const typedValue = value as FileCellEditorValue;

  return (
    typeof typedValue.files === "object" &&
    typedValue.files !== null &&
    Array.isArray(typedValue.files.newFiles) &&
    Array.isArray(typedValue.files.attachedFiles) &&
    typedValue.files.attachedFiles.every(isStoredFile) &&
    Array.isArray(typedValue.deletedFiles) &&
    typedValue.deletedFiles.every(isStoredFile)
  );
};

const parseFileValue = (
  value: FileCellEditorProps["value"],
): {
  newFiles: File[];
  attachedFiles: StoredFile[];
  deletedFiles: StoredFile[];
} => {
  if (!value) {
    return {
      newFiles: [],
      attachedFiles: [],
      deletedFiles: [],
    };
  }

  if (isDbFileFieldValue(value)) {
    return {
      newFiles: [],
      attachedFiles: value.files,
      deletedFiles: [],
    };
  }

  if (isEditorFileValue(value)) {
    return {
      newFiles: value.files.newFiles,
      attachedFiles: value.files.attachedFiles,
      deletedFiles: value.deletedFiles,
    };
  }

  return {
    newFiles: [],
    attachedFiles: [],
    deletedFiles: [],
  };
};

const buildFilesSignature = (
  newFiles: File[],
  attachedFiles: StoredFile[],
  deletedFiles: StoredFile[],
): string => {
  const newFilesNames = newFiles.map((file) => file.name).join("|");
  const attachedFileNames = attachedFiles.map((file) => `${file.name}:${file.path}`).join("|");
  const deletedFileNames = deletedFiles.map((file) => `${file.name}:${file.path}`).join("|");

  return `${newFilesNames}::${attachedFileNames}::${deletedFileNames}`;
};

const getUploadRowSx = ({
  hasError,
  isDragActive,
}: {
  hasError: boolean;
  isDragActive: boolean;
}) => ({
  width: "100%",
  minWidth: 0,
  height: 34,
  borderRadius: "10px",
  border: "1px dashed",
  borderColor: hasError ? "#d32f2f" : isDragActive ? "#7c9cc9" : "#d7deea",
  backgroundColor: isDragActive ? "#f3f7fd" : "#ffffff",
  padding: "0 8px",
  boxShadow: hasError ? "0 0 0 2px rgba(211, 47, 47, 0.14)" : "0 1px 2px rgba(16, 24, 40, 0.04)",
  display: "grid",
  gridTemplateColumns: "18px minmax(0, 1fr)",
  alignItems: "center",
  gap: "6px",
  boxSizing: "border-box",
  cursor: "pointer",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
  overflow: "hidden",

  "&:hover": {
    borderColor: hasError ? "#d32f2f" : "#b8c4d6",
    backgroundColor: "#fbfcfe",
  },

  "& .MuiSvgIcon-root": {
    fontSize: 17,
    color: hasError ? "#d32f2f" : "#64748b",
  },
});

const deleteButtonSx = {
  width: 22,
  height: 22,
  minWidth: 22,
  borderRadius: "7px",
  color: "#a54160",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "&:hover": {
    backgroundColor: "rgba(165, 65, 96, 0.08)",
  },

  "& .MuiSvgIcon-root": {
    fontSize: 15,
  },
};

const fileRowSx = (existing: boolean) => ({
  width: "100%",
  minWidth: 0,
  height: 32,
  borderRadius: "9px",
  border: "1px solid",
  borderColor: existing ? "#d7deea" : "#d4e3ff",
  backgroundColor: existing ? "#ffffff" : "#eef4ff",
  display: "grid",
  gridTemplateColumns: "18px minmax(0, 1fr) 22px",
  alignItems: "center",
  gap: "6px",
  px: "7px",
  boxSizing: "border-box",
  overflow: "hidden",
  flexShrink: 0,
});

const fileNameSx = {
  minWidth: 0,
  fontSize: "0.9rem",
  lineHeight: 1.25,
  fontWeight: 400,
  color: "#0f172a",
  textAlign: "right",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "block",
};

export const FileCellEditor: React.FC<FileCellEditorProps> = ({
  value,
  onChange,
  isRequired = false,
  errorMessage,
}) => {
  const parsedValue = useMemo(() => parseFileValue(value), [value]);

  const [files, setFiles] = useState<File[]>(parsedValue.newFiles);
  const [responseFiles, setResponseFiles] = useState<StoredFile[]>(parsedValue.attachedFiles);
  const [deletedFiles, setDeletedFiles] = useState<StoredFile[]>(parsedValue.deletedFiles);

  const lastEmittedSignatureRef = useRef(
    buildFilesSignature(parsedValue.newFiles, parsedValue.attachedFiles, parsedValue.deletedFiles),
  );

  useEffect(() => {
    const nextValue = parseFileValue(value);

    setFiles(nextValue.newFiles);
    setResponseFiles(nextValue.attachedFiles);
    setDeletedFiles(nextValue.deletedFiles);

    lastEmittedSignatureRef.current = buildFilesSignature(
      nextValue.newFiles,
      nextValue.attachedFiles,
      nextValue.deletedFiles,
    );
  }, [value]);

  useEffect(() => {
    const currentSignature = buildFilesSignature(files, responseFiles, deletedFiles);

    if (currentSignature === lastEmittedSignatureRef.current) return;

    lastEmittedSignatureRef.current = currentSignature;

    const payload: FileCellEditorValue = {
      files: {
        newFiles: files,
        attachedFiles: responseFiles,
      },
      deletedFiles,
    };

    const hasAnyFiles = files.length + responseFiles.length > 0;
    const isValid = !(isRequired && !hasAnyFiles);

    onChange(payload, isValid);
  }, [files, responseFiles, deletedFiles, isRequired, onChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const deleteNewFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, currentIndex) => currentIndex !== index));
  };

  const deleteAttachedFile = (file: StoredFile, index: number) => {
    setResponseFiles((prevFiles) => prevFiles.filter((_, currentIndex) => currentIndex !== index));
    setDeletedFiles((prevFiles) => [...prevFiles, file]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: true,
  });

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const hasError = !!errorMessage;
  const hasFiles = files.length > 0 || responseFiles.length > 0;
  const filesCount = files.length + responseFiles.length;

  const renderFileRow = ({
    name,
    existing = false,
    onDelete,
  }: {
    name: string;
    existing?: boolean;
    onDelete: () => void;
  }) => (
    <Tooltip title={name} arrow>
      <Box sx={fileRowSx(existing)}>
        <InsertDriveFileOutlinedIcon
          sx={{
            fontSize: 17,
            color: existing ? "#64748b" : "#506f9e",
            display: "block",
            justifySelf: "center",
          }}
        />

        <Box component="span" dir="auto" sx={fileNameSx}>
          {name}
        </Box>

        <IconButton
          size="small"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete();
          }}
          sx={deleteButtonSx}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Tooltip>
  );

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        maxHeight: "100%",
        display: "grid",
        gridTemplateRows: "34px minmax(0, 1fr)",
        gap: "6px",
        padding: "5px 7px",
        boxSizing: "border-box",
        direction: "rtl",
        overflow: "hidden",
      }}>
      <Box {...getRootProps()} sx={getUploadRowSx({ hasError, isDragActive })}>
        <input {...getInputProps()} />

        <AttachFileIcon />

        <Box
          component="span"
          sx={{
            minWidth: 0,
            fontSize: "0.92rem",
            lineHeight: 1.25,
            color: isDragActive ? "#334155" : "#0f172a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "right",
          }}>
          {isDragActive
            ? "שחרר קבצים כאן..."
            : filesCount > 0
              ? `הוסף קבצים (${filesCount})`
              : "לחץ או גרור קבצים"}
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          overflowY: "auto",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}>
        {!hasFiles ? (
          <Box
            component="span"
            sx={{
              width: "100%",
              minHeight: 32,
              borderRadius: "9px",
              border: "1px dashed #cbd5e1",
              backgroundColor: "#fbfcfe",
              color: "#94a3b8",
              fontSize: "0.9rem",
              lineHeight: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}>
            אין קבצים
          </Box>
        ) : (
          <>
            {files.map((file, index) =>
              renderFileRow({
                name: file.name,
                onDelete: () => deleteNewFile(index),
              }),
            )}

            {responseFiles.map((file, index) =>
              renderFileRow({
                name: file.name,
                existing: true,
                onDelete: () => deleteAttachedFile(file, index),
              }),
            )}

            {errorMessage && (
              <Box
                component="span"
                sx={{
                  width: "100%",
                  fontSize: "0.8rem",
                  lineHeight: 1.2,
                  color: "#d32f2f",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}>
                {errorMessage}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
