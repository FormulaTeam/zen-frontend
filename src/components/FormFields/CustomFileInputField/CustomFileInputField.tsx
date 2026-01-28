import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileIcon, defaultStyles } from "react-file-icon";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import UploadIcon from "../../../images/Upload-icon.svg";
import { decodeFileName } from "../../../utils/utils";
import { uploadFilesToS3 } from "../../../api/filesApi";

type FileMeta = { name: string; url: string };

interface CustomFileInputFieldProps extends CustomInputFormFieldProps {
  formId: number;
  value: any; // expected { files: FileMeta[] }
  isTabularEdit?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getExt = (filename: string) => filename.split(".").pop()?.toLowerCase() || "file";

const toFileMetaArray = (uploaded: any): FileMeta[] => {
  const arr = Array.isArray(uploaded) ? uploaded : [];
  return arr
    .map((f) => {
      const name = f?.name ?? f?.fileName ?? "";
      const url = f?.url ?? f?.fileUrl ?? "";
      if (typeof name !== "string" || typeof url !== "string") return null;
      if (!name.trim() || !url.trim()) return null;
      return { name, url };
    })
    .filter(Boolean) as FileMeta[];
};

const CustomFileInputField: React.FC<CustomFileInputFieldProps> = ({
  formId,
  value,
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const theme = useTheme();

  // Always normalize the incoming value to { files: [] }
  const attachedFiles: FileMeta[] = useMemo(() => {
    const files = value?.files;
    return Array.isArray(files)
      ? files
          .filter((f: any) => f && typeof f.name === "string" && typeof f.url === "string")
          .map((f: any) => ({ name: f.name, url: f.url }))
      : [];
  }, [value]);

  const [files, setFiles] = useState<FileMeta[]>(attachedFiles);
  const [errorMsg, setErrorMsg] = useState(""); // only for upload/drop errors
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFiles(attachedFiles);
  }, [attachedFiles]);

  // Push value to parent
  const pushUp = useCallback(
    (nextFiles: FileMeta[]) => {
      onChangeHandler({ files: nextFiles }, true);
    },
    [onChangeHandler],
  );

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (isDisabled) return;

      const validFiles = accepted.filter((f) => f.size <= MAX_FILE_SIZE);
      if (validFiles.length !== accepted.length) {
        setErrorMsg("קובץ אחד או יותר גדול מ-10 MB ולא הועלה. גודל מקסימלי: 10 MB");
      } else {
        setErrorMsg("");
      }
      if (!validFiles.length) return;

      try {
        setUploading(true);

        const uploaded = await uploadFilesToS3({ newFiles: validFiles }, formId);
        const uploadedMetas = toFileMetaArray(uploaded);

        if (!uploadedMetas.length) {
          setErrorMsg("העלאת הקבצים נכשלה: לא התקבלו כתובות קבצים");
          return;
        }

        const merged = [...files];
        const existingUrls = new Set(merged.map((f) => f.url));
        uploadedMetas.forEach((f) => {
          if (!existingUrls.has(f.url)) merged.push(f);
        });

        pushUp(merged);

        setFiles(merged);
        setErrorMsg("");
      } catch (e) {
        console.error(e);
        setErrorMsg("שגיאה בהעלאת הקבצים");
      } finally {
        setUploading(false);
      }
    },
    [files, isDisabled, pushUp, formId],
  );

  const onDropRejected = useCallback((fileRejections: any[]) => {
    const tooLarge = fileRejections
      .map((r) => r.file as File)
      .filter((f) => f.size > MAX_FILE_SIZE);

    if (tooLarge.length) {
      const names = tooLarge.map((f) => f.name).join(", ");
      setErrorMsg(`הקבצים הבאים גדולים מ-10 MB ולא הועלו: ${names}. גודל מקסימלי: 10 MB`);
    }
  }, []);

  const removeFile = useCallback(
    (event: any, idx: number) => {
      event.stopPropagation();

      const next = files.filter((_, i) => i !== idx);

      pushUp(next);

      setFiles(next);

      setErrorMsg("");
    },
    [files, pushUp],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxSize: MAX_FILE_SIZE,
    disabled: isDisabled || uploading,
  });

  const invalidFromZod =
    typeof isValid === "object" &&
    isValid &&
    "valid" in isValid &&
    (isValid as any).valid === false;

  const zodMsg = invalidFromZod && "message" in (isValid as any) ? (isValid as any).message : "";

  return (
    <FormControl className={invalidFromZod ? classes.invalid : ""}>
      {!isTabularEdit && (
        <FormLabel
          style={{ fontSize: 14, color: errorMsg || invalidFromZod ? "red" : undefined }}
          error={invalidFromZod}
          required={isRequired}>
          {label}
        </FormLabel>
      )}

      {isDisabled ? (
        <div className={classes["view-only"]}>
          {!!files.length &&
            files.map((f, idx) => {
              const ext = getExt(decodeFileName(f.name));
              return (
                <label key={idx} title={decodeFileName(f.name)} className="response-file-view">
                  <FileIcon extension={ext} {...(defaultStyles[ext] || {})} />
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {decodeFileName(f.name)}
                  </a>
                </label>
              );
            })}
        </div>
      ) : (
        <>
          <Box
            sx={{
              backgroundColor: theme.palette.shadow,
              ...(isTabularEdit && { border: "none", minHeight: "32px" }),
            }}
            {...getRootProps()}
            className={classes["file-input-container"]}>
            <input {...getInputProps()} />
            <section>
              {uploading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} />
                  <Typography variant={isTabularEdit ? "caption" : "subtitle2"}>
                    מעלה קבצים...
                  </Typography>
                </Box>
              ) : isDragActive ? (
                <Typography variant="subtitle2">שחרר את הקבצים כאן...</Typography>
              ) : (
                <>
                  {files.length === 0 && <img src={UploadIcon} alt="" />}
                  <Typography variant={isTabularEdit ? "caption" : "subtitle2"}>
                    {isTabularEdit ? "עלה קבצים" : "גרור את הקבצים או לחץ כאן"}
                  </Typography>
                </>
              )}
            </section>
          </Box>

          <Box sx={{ display: "flex", alignSelf: "end", fontSize: 14, color: "red" }}>
            {errorMsg || zodMsg}
          </Box>

          <section className={classes["items-preview"]}>
            {files.map((f, idx) => {
              const ext = getExt(decodeFileName(f.name));
              return (
                <Tooltip title={<p style={{ fontSize: 12 }}>{decodeFileName(f.name)}</p>} key={idx}>
                  <div className={classes["file-item"]}>
                    <div className={classes["file-info"]}>
                      <FileIcon extension={ext} {...(defaultStyles[ext] || {})} />
                      <p>{decodeFileName(f.name)}</p>
                    </div>
                    <IconButton onClick={(e) => removeFile(e, idx)}>
                      <CloseIcon color="error" sx={{ fontSize: 14 }} />
                    </IconButton>
                  </div>
                </Tooltip>
              );
            })}
          </section>
        </>
      )}
    </FormControl>
  );
};

export default CustomFileInputField;
