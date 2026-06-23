import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import classes from "./CustomFileInputField.module.scss";
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileIcon, defaultStyles } from "react-file-icon";
import UploadIcon from "../../../images/Upload-icon.svg";
import { downloadFileFromResponse } from "../../../api/filesApi";
import FieldErrorText from "../FieldErrorText/FieldErrorText";

interface CustomFileInputFieldProps {
  value: any;
  isDisabled: boolean;
  onChangeHandler: (value: any) => void;
  onBlurHandler?: () => void;
  isValid?: boolean;
  label: string;
  isRequired: boolean;
  isTabularEdit?: boolean;
  formId?: number | string;
  validationMessage?: string | null;
  validationDetail?: string | null;
}

type FileItem = {
  name: string;
  path: string;
  file?: File;
  url?: string;
  fileName?: string;
  relativePath?: string;
  [key: string]: any;
};

const normalizeIncomingValue = (value: any): FileItem[] => {
  if (!Array.isArray(value?.files)) {
    return [];
  }

  return value.files
    .map((file: any) => {
      const rawName = file?.name || file?.fileName || "";
      const name = typeof rawName === "string" ? rawName : "";
      const path =
        typeof file?.path === "string" && file.path.trim().length > 0
          ? file.path
          : typeof file?.relativePath === "string" && file.relativePath.trim().length > 0
            ? file.relativePath
            : name
              ? `./${name}`
              : "";

      return {
        ...file,
        name,
        path,
      };
    })
    .filter((file: FileItem) => file.name.trim().length > 0 && file.path.trim().length > 0);
};

const CustomFileInputField: React.FC<CustomFileInputFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  onBlurHandler,
  label,
  isRequired,
  isTabularEdit = false,
  formId,
  validationMessage,
  validationDetail,
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileItem[]>(() => normalizeIncomingValue(value));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = normalizeIncomingValue(value);
    setFiles(normalized);
  }, [value]);

  const getFileExtension = (filename: string) => filename.split(".").pop()?.toLowerCase() || "file";

  const emitChange = useCallback(
    (nextFiles: FileItem[]) => {
      setFiles(nextFiles);
      onChangeHandler({ files: nextFiles });
    },
    [onChangeHandler],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setLocalError(null);

      if (fileRejections && fileRejections.length > 0) {
        const hasSizeError = fileRejections.some((rejection) =>
          rejection.errors.some((e: any) => e.code === "file-too-large")
        );

        if (hasSizeError) {
          setLocalError("גודל הקובץ חורג מהרף המותר (10MB)");
        } else {
          setLocalError("קובץ לא תקין");
        }
      }

      const droppedFiles: FileItem[] = acceptedFiles.map((file) => {
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || "";

        return {
          name: file.name,
          path: relativePath || `./${file.name}`,
          file,
        };
      });

      emitChange([...files, ...droppedFiles]);
      onBlurHandler?.();
    },
    [files, emitChange, onBlurHandler],
  );

  const deleteFile = useCallback(
    (event: React.MouseEvent, index: number) => {
      event.stopPropagation();
      setLocalError(null);
      emitChange(files.filter((_, idx) => idx !== index));
      onBlurHandler?.();
    },
    [files, emitChange, onBlurHandler],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isDisabled,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <FormControl
      error={Boolean(validationMessage)}
      className={validationMessage ? classes.invalid : ""}>
      {!isTabularEdit && (
        <FormLabel
          sx={{
            fontSize: "1.3rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            "&.Mui-focused": {
              color: theme.palette.primary.main,
            },
          }}
          error={Boolean(validationMessage)}
          required={isRequired}>
          {label}
        </FormLabel>
      )}

      {isDisabled ? (
        <div className={classes["view-only"]}>
          {files.map((item, idx) => {
            const displayName = item.name || item.fileName || "";
            const extension = getFileExtension(displayName) || item.fileExtension || "";

            return (
              <div
                key={`${displayName}-${idx}`}
                title={displayName}
                style={{
                  display: "inline-block",
                  width: "40px",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
                onClick={() => formId && downloadFileFromResponse(item, formId)}>
                <FileIcon extension={extension} {...(defaultStyles[extension] || {})} />
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <Box
            sx={{
              backgroundColor: theme.palette.shadow,
              ...(isTabularEdit && {
                border: "none",
                minHeight: "32px",
              }),
            }}
            {...getRootProps()}
            className={classes["file-input-container"]}>
            <input {...getInputProps()} disabled={isDisabled} />
            <section style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {isDragActive ? (
                <Typography variant="subtitle2">שחרר את הקבצים כאן...</Typography>
              ) : (
                <>
                  {files.length === 0 && <img src={UploadIcon} />}
                  <Typography variant={isTabularEdit ? "caption" : "subtitle2"}>
                    {isTabularEdit ? "עלה קבצים" : "גרור את הקבצים או לחץ כאן"}
                  </Typography>
                  {!isTabularEdit && (
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                      גודל קובץ מקסימלי: 10MB
                    </Typography>
                  )}
                </>
              )}
            </section>
          </Box>

          <section className={classes["items-preview"]}>
            {files.map((file, index) => {
              const displayName = file.name || file.fileName || "";
              const fileExtension = getFileExtension(displayName);

              return (
                <Tooltip
                  title={<p style={{ fontSize: 12 }}>{displayName}</p>}
                  key={`${displayName}-${index}`}>
                  <div className={classes["file-item"]}>
                    <div className={classes["file-info"]}>
                      <FileIcon
                        extension={fileExtension}
                        {...(defaultStyles[fileExtension] || {})}
                      />
                      <p>{displayName}</p>
                    </div>
                    <IconButton onClick={(event) => deleteFile(event, index)}>
                      <CloseIcon color="error" sx={{ fontSize: 14 }} />
                    </IconButton>
                  </div>
                </Tooltip>
              );
            })}
          </section>
        </>
      )}

      <FormHelperText>
        <FieldErrorText message={localError || validationMessage} detail={validationDetail} />
      </FormHelperText>
    </FormControl>
  );
};

export default CustomFileInputField;
