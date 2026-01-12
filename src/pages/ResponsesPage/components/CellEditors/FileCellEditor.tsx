import React, { useCallback, useEffect, useState } from "react";
import { Box, Chip, styled, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { decodeFileName } from "../../../../utils/utils";

const StyledContainer = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "8px",
    maxHeight: "170px",
    width: "100%",
    overflowY: "auto",
});

const StyledDropzone = styled(Box)<{ isDragActive: boolean }>(({ theme, isDragActive }) => ({
    border: "2px dashed",
    borderColor: isDragActive ? theme.palette.primary.main : theme.palette.grey[400],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: isDragActive ? theme.palette.action.hover : "transparent",
    width: "100%",
    display: 'flex',
    height: '130px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledFilesContainer = styled(Box)({
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
});

const StyledChip = styled(Chip)({
    fontSize: "1rem",
});

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

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    return (
        <StyledContainer onClick={handleClick}>
            <StyledDropzone {...getRootProps()} isDragActive={isDragActive}>
                <input {...getInputProps()} />
                <AttachFileIcon fontSize="small" />
                <Typography variant="caption" display="block">
                    {isDragActive ? "שחרר קבצים כאן..." : "לחץ או גרור קבצים"}
                </Typography>
            </StyledDropzone>

            {files.length > 0 && (
                <StyledFilesContainer>
                    {files.map((file, index) => (
                        <StyledChip
                            key={`new-${index}`}
                            label={file.name}
                            size="small"
                            onDelete={() => deleteNewFile(index)}
                            deleteIcon={<CloseIcon fontSize="small" />}
                        />
                    ))}
                </StyledFilesContainer>
            )}

            {responseFiles?.files && responseFiles.files.length > 0 && (
                <StyledFilesContainer>
                    {responseFiles.files.map((file: any, index: number) => (
                        <StyledChip
                            key={`attached-${index}`}
                            label={decodeFileName(file.name)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            onDelete={() => deleteAttachedFile(file, index)}
                            deleteIcon={<CloseIcon fontSize="small" />}
                        />
                    ))}
                </StyledFilesContainer>
            )}
        </StyledContainer>
    );
};
