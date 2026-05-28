import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, styled, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const StyledContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  height: "100%",
  padding: "4px 6px",
  overflow: "hidden",
  width: "100%",
  overflowY: "auto",
  boxSizing: "border-box",
});

const StyledDropzone = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$isDragActive",
})<{
  $isDragActive: boolean;
}>(({ theme, $isDragActive }) => ({
  border: "1.5px dashed",
  borderColor: $isDragActive ? theme.palette.primary.main : theme.palette.grey[400],
  borderRadius: 8,
  padding: "4px 8px",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: $isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
  width: "100%",
  minHeight: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxSizing: "border-box",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.light,
  },
}));

const StyledFilesContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
});

const StyledChip = styled(Chip)({
  maxWidth: 180,
  fontSize: "0.85rem",
  height: 26,
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const SectionLabel = styled(Typography)(({ theme }) => ({
  display: "block",
  marginBottom: 4,
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
}));

const ErrorText = styled("div")(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: "0.75rem",
}));

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
    setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
  };

  const deleteAttachedFile = (file: StoredFile, index: number) => {
    setResponseFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
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

  return (
    <StyledContainer onClick={handleClick}>
      <StyledDropzone {...getRootProps()} $isDragActive={isDragActive}>
        <input {...getInputProps()} />

        <AttachFileIcon fontSize="small" color="primary" />

        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {isDragActive ? "שחרר קבצים כאן..." : "לחץ או גרור קבצים"}
        </Typography>
      </StyledDropzone>

      {files.length > 0 && (
        <Box>
          <SectionLabel>קבצים חדשים:</SectionLabel>

          <StyledFilesContainer>
            {files.map((file, index) => (
              <StyledChip
                key={`new-${file.name}-${index}`}
                label={file.name}
                size="small"
                color="primary"
                variant="filled"
                onDelete={() => deleteNewFile(index)}
                deleteIcon={<CloseIcon fontSize="small" />}
              />
            ))}
          </StyledFilesContainer>
        </Box>
      )}

      {responseFiles.length > 0 && (
        <Box>
          <SectionLabel>קבצים קיימים:</SectionLabel>

          <StyledFilesContainer>
            {responseFiles.map((file, index) => (
              <StyledChip
                key={`attached-${file.path}-${index}`}
                label={file.name}
                size="small"
                color="default"
                variant="outlined"
                onDelete={() => deleteAttachedFile(file, index)}
                deleteIcon={<CloseIcon fontSize="small" />}
              />
            ))}
          </StyledFilesContainer>
        </Box>
      )}

      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
    </StyledContainer>
  );
};
