import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { decodeFileName } from "../../../../utils/utils";

interface FileCellEditorProps {
    value: any;
    onChange: (value: any) => void;
    isRequired?: boolean;
}

export const FileCellEditor: React.FC<FileCellEditorProps> = ({
    value,
    onChange,
    isRequired = false,
}) => {
    const [responseFiles, setResponseFiles] = useState<any>(value || []);
    const [files, setFiles] = useState<File[]>([]);
    const [deletedFiles, setDeletedFiles] = useState<File[]>([]);

    useEffect(() => {
        setResponseFiles(value || []);
    }, [value]);

    useEffect(() => {
        const combinedFiles = {
            newFiles: files,
            attachedFiles: responseFiles?.files || [],
            deletedFiles: deletedFiles,
        };
        onChange(combinedFiles);
    }, [files, responseFiles, deletedFiles]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const deleteNewFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
    };

    const deleteAttachedFile = (file: any, index: number) => {
        setResponseFiles((prevFiles: any) => ({
            ...prevFiles,
            files: prevFiles.files.filter((_: any, idx: number) => idx !== index),
        }));
        file.name = decodeFileName(file.name);
        setDeletedFiles((prevFiles) => [...prevFiles, file]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: false,
        noKeyboard: true,
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Stop event propagation to prevent grid navigation
        event.stopPropagation();
    };

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                padding: "8px",
                maxHeight: "120px",
                overflowY: "auto",
            }}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
        >
            {/* Dropzone */}
            <Box
                {...getRootProps()}
                sx={{
                    border: "2px dashed",
                    borderColor: isDragActive ? "primary.main" : "grey.400",
                    borderRadius: 1,
                    padding: 1,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragActive ? "action.hover" : "transparent",
                    "&:hover": {
                        backgroundColor: "action.hover",
                    },
                }}
            >
                <input {...getInputProps()} />
                <AttachFileIcon fontSize="small" />
                <Typography variant="caption" display="block">
                    {isDragActive ? "שחרר קבצים כאן..." : "לחץ או גרור קבצים"}
                </Typography>
            </Box>

            {/* Display new files */}
            {files.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {files.map((file, index) => (
                        <Chip
                            key={`new-${index}`}
                            label={file.name}
                            size="small"
                            onDelete={() => deleteNewFile(index)}
                            deleteIcon={<CloseIcon fontSize="small" />}
                            sx={{ fontSize: "0.75rem" }}
                        />
                    ))}
                </Box>
            )}

            {/* Display attached files */}
            {responseFiles?.files && responseFiles.files.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {responseFiles.files.map((file: any, index: number) => (
                        <Chip
                            key={`attached-${index}`}
                            label={decodeFileName(file.name)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            onDelete={() => deleteAttachedFile(file, index)}
                            deleteIcon={<CloseIcon fontSize="small" />}
                            sx={{ fontSize: "0.75rem" }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};
