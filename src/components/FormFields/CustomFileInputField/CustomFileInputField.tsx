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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

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
  const [errorMsg, setErrorMsg] = useState("");
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
    const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE);
    
    if (validFiles.length !== acceptedFiles.length) {
      setErrorMsg("קובץ אחד או יותר גדול מ-10 MB ולא הועלה. גודל מקסימלי: 10 MB");
    } else {
      setErrorMsg("");
    }
    setFiles(validFiles);
  }, []);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    const rejectedFiles = fileRejections.map(rejection => rejection.file);
    const tooLargeFiles = rejectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (tooLargeFiles.length > 0) {
      const fileNames = tooLargeFiles.map(f => f.name).join(", ");
      setErrorMsg(`הקבצים הבאים גדולים מ-10 MB ולא הועלו: ${fileNames}. גודל מקסימלי: 10 MB`);
    }
  }, []);

  const deleteFileBeforeUpload = (event, file, index) => {
    event.stopPropagation();
    if(isRequired && combinedFiles?.newFiles.length === 1){
      setErrorMsg("שדה זה הינו חובה");
    }
    //setCombinedFiles((prevFiles) => ({...prevFiles.filter((_, idx) => idx !== index)}));
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxSize:MAX_FILE_SIZE, onDropRejected });

  useEffect(() => {
    setCombinedFiles({
      newFiles: files,
      attachedFiles: responseFiles?.files || [],
    });
  }, [responseFiles, files]);

  useEffect(() => {
    onChangeHandler({ files: combinedFiles, deletedFiles }, true);
  }, [combinedFiles]);

  useEffect(()=>{    
    if(isRequired && combinedFiles?.newFiles.length === 0 && combinedFiles?.newFiles.length === 0  && !isValid){
      setErrorMsg("שדה זה הינו חובה");
    }
  },[isValid])

  return (
    <FormControl className={isRequired && combinedFiles?.newFiles.length === 0 && combinedFiles?.newFiles.length === 0 && !isValid ? classes.invalid : !isValid ? classes.invalid : ""}>
      {!isTabularEdit && (
        <FormLabel style={{ fontSize: 14, color: errorMsg && "red" }} error={!isValid} required={isRequired}>
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
          <Box sx={{
            display:'flex',
            alignSelf:'end',
            fontSize:14,
            color:'red'
          }}>{errorMsg}</Box>
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
