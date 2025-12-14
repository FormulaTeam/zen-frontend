import { useCallback, useEffect, useState } from "react";
import CustomTextField from "./CustomTextField";
import { useDropzone } from "react-dropzone";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

const CustomFileInputField: React.FC<GenericFieldsProps> = ({
  onChange,
  error,
  helperText,
  label,
  required,
  value,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [filesName, setFilesName] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prev) => {
        const listOfFiles = [...prev, ...acceptedFiles];
        setFilesName((prev) => [...prev, ...acceptedFiles.map((file) => file.name)]);
        onChange(listOfFiles);
        return listOfFiles;
      });
    },
    [onChange],
  );

  const { getInputProps, getRootProps } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 1024 * 1024 * 10, // 10MB
  });

  // useEffect(() => {
  //   console.log("value!!", value);
  //   value && setFilesName(value.map((file) => file.path));
  // }, [value]);

  return (
    <div {...getRootProps()}>
      <CustomTextField
        required={required}
        label={label}
        value=""
        onChange={() => {}}
        error={error}
        helperText={helperText}
      />
      <input {...getInputProps()} type="file" />
      {filesName.length > 0 && (
        <Box>
          {filesName.map((fileName, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle2">{fileName}</Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles(files.filter((f) => f.name !== fileName));
                  onChange(files.filter((f) => f.name !== fileName));
                }}>
                <CloseIcon color="error" sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
};
export default CustomFileInputField;
