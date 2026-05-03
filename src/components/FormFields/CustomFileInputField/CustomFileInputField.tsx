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
    (acceptedFiles: File[]) => {
      const droppedFiles: FileItem[] = acceptedFiles.map((file) => {
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || "";

        return {
          name: file.name,
          path: relativePath || `./${file.name}`,
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
      emitChange(files.filter((_, idx) => idx !== index));
      onBlurHandler?.();
    },
    [files, emitChange, onBlurHandler],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isDisabled,
  });

  return (
    <FormControl
      error={Boolean(validationMessage)}
      className={validationMessage ? classes.invalid : ""}>
      {!isTabularEdit && (
        <FormLabel
          style={{ fontSize: 14 }}
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
                onClick={() => downloadFileFromResponse(item, formId ? String(formId) : undefined)}>
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
            <section>
              {isDragActive ? (
                <Typography variant="subtitle2">שחרר את הקבצים כאן...</Typography>
              ) : (
                <>
                  {files.length === 0 && <img src={UploadIcon} />}
                  <Typography variant={isTabularEdit ? "caption" : "subtitle2"}>
                    {isTabularEdit ? "עלה קבצים" : "גרור את הקבצים או לחץ כאן"}
                  </Typography>
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
        <FieldErrorText message={validationMessage} detail={validationDetail} />
      </FormHelperText>
    </FormControl>
  );
};

export default CustomFileInputField;
