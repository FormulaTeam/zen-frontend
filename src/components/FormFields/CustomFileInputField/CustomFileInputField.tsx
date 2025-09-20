import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import classes from "./CustomFileInputField.module.scss";
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  InputBase,
  InputLabel,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileIcon, defaultStyles } from "react-file-icon";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import UploadIcon from "../../../images/Upload-icon.svg";
import { decodeFileName } from "../../../utils/utils";

interface CustomFileInputFieldProps extends CustomInputFormFieldProps {
  value: any;
  isTabularEdit?: boolean;
}

const CustomFileInputField: React.FC<CustomFileInputFieldProps> = ({
  value,
  isDisabled,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const [responseFiles, setResponseFiles] = useState<any>(value || []);
  const [files, setFiles] = useState<File[]>([]);
  const [combinedFiles, setCombinedFiles] = useState<any>({
    newFiles: [],
    attachedFiles: responseFiles?.files || [],
  });
  const [deletedFiles, setDeletedFiles] = useState<File[]>([]);
  const theme = useTheme();
  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "file"; // Default to "file" if no extension
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const onDeleteFileItem = (event, file, index) => {
    event.stopPropagation();
    setDeletedFiles((prevFiles) => [...prevFiles, file]);
  };

  const deleteFileBeforeUpload = (event, file, index) => {
    event.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
  };

  const onDeleteAttachedFileItem = (event, file, index) => {
    event.stopPropagation();
    setResponseFiles((prevFiles) => ({
      ...prevFiles,
      files: prevFiles.files.filter((_, idx) => idx !== index),
    }));
    file.name = decodeFileName(file.name); // decode the file name for better readability, url stays the same
    setDeletedFiles((prevFiles) => [...prevFiles, file]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    setCombinedFiles({
      newFiles: files,
      attachedFiles: responseFiles?.files || [],
    });
  }, [responseFiles, files]);

  useEffect(() => {
    onChangeHandler({ files: combinedFiles, deletedFiles }, true);
  }, [combinedFiles]);

  return (
    <FormControl className={!isValid ? classes.invalid : ""}>
      {!isTabularEdit && (
        <FormLabel style={{ fontSize: 14 }} error={!isValid} required={isRequired}>
          {label}
        </FormLabel>
      )}
      {isDisabled ? (
        <div className={classes["view-only"]}>
          {responseFiles?.files?.length &&
            responseFiles?.files?.map((item, idx) => {
              return (
                <label key={idx} title={item.fileName} className="response-file-view">
                  <FileIcon
                    extension={item.fileExtension}
                    {...(defaultStyles[item.fileExtension] || {})}
                  />
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                    {item.fileName + item.fileExtension}
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
              ...(isTabularEdit && {
                border: 'none',
                minHeight: '32px',
              })
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
            {files?.map((file, index) => {
              const fileExtension = getFileExtension(file.name);
              return (
                <Tooltip title={<p style={{ fontSize: 12 }}>{file.name}</p>} key={index}>
                  <>
                    <div className={classes["file-item"]} key={index}>
                      <div className={classes["file-info"]}>
                        <FileIcon
                          extension={fileExtension}
                          {...(defaultStyles[fileExtension] || {})}
                        />
                        <p>{file.name}</p>
                      </div>
                      <IconButton onClick={(event) => deleteFileBeforeUpload(event, file, index)}>
                        <CloseIcon color="error" sx={{ fontSize: 14 }} />
                      </IconButton>
                    </div>
                  </>
                </Tooltip>
              );
            })}
          </section>
          <section
            className={`${classes["items-preview"]} attached-files`}
            style={{ flexDirection: "row" }}>
            {responseFiles?.files?.length &&
              responseFiles?.files?.map((file, index) => {
                const fileExtension = getFileExtension(decodeFileName(file.name));

                return (
                  <Tooltip
                    title={<p style={{ fontSize: 12 }}>{decodeFileName(file.name)}</p>}
                    key={index}>
                    <>
                      <div className={classes["file-item"]} key={index}>
                        <div className={classes["file-info"]}>
                          <FileIcon
                            extension={fileExtension}
                            {...(defaultStyles[fileExtension] || {})}
                          />
                          <p>{decodeFileName(file.name)}</p>
                        </div>
                        <IconButton
                          sx={{ p: 0.2 }}
                          onClick={(event) => onDeleteAttachedFileItem(event, file, index)}>
                          <CloseIcon color="error" sx={{ fontSize: 14 }} />
                        </IconButton>
                      </div>
                    </>
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
