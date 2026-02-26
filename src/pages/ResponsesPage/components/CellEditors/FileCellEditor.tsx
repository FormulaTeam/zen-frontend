import React, { useCallback, useEffect, useState, useRef } from "react";
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

const StyledDropzone = styled(Box, { shouldForwardProp: (prop) => prop !== '$isDragActive' })<{
    $isDragActive: boolean;
}>(({ theme, $isDragActive }) => ({
    border: "2px dashed",
    borderColor: $isDragActive ? theme.palette.primary.main : theme.palette.grey[400],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: $isDragActive ? theme.palette.action.hover : "transparent",
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

interface AttachedFile {
    name: string;
    fileName?: string;
    fileUrl?: string;
    fileExtension?: string;
    [key: string]: any;
}

interface FileCellEditorValue {
    files: {
        newFiles: File[];
        attachedFiles: AttachedFile[];
    };
    deletedFiles: AttachedFile[];
}

interface FileCellEditorProps {
    value: FileCellEditorValue | null;
    onChange: (value: FileCellEditorValue, isValid: boolean) => void;
    isRequired?: boolean;
    errorMessage?: string;
}

export const FileCellEditor: React.FC<FileCellEditorProps> = ({
    value,
    onChange,
    isRequired = false,
    errorMessage,
}) => {
    const parseFileValue = (value) => {
        if (!value || typeof value !== "object") return { newFiles: [], attachedFiles: [] };

        if (Array.isArray(value.files)) {
            return { newFiles: [], attachedFiles: value.files };
        }

        if (value.files && typeof value.files === 'object') {
            return {
                newFiles: value.files.newFiles || [],
                attachedFiles: value.files.attachedFiles || []
            };
        }

        return { newFiles: [], attachedFiles: [] };
    };

    const fileState = parseFileValue(value);
    const [files, setFiles] = useState<File[]>(fileState.newFiles);
    const [responseFiles, setResponseFiles] = useState<AttachedFile[]>(fileState.attachedFiles);
    const [deletedFiles, setDeletedFiles] = useState<AttachedFile[]>(
        (value && typeof value === "object" && value.deletedFiles) ? value.deletedFiles : []
    );

    // Update internal state when the external value prop changes
    useEffect(() => {
        const fileState = parseFileValue(value);
        setResponseFiles(fileState.attachedFiles);
        setFiles(fileState.newFiles);
        if (value && typeof value === "object" && value.deletedFiles) {
            setDeletedFiles(value.deletedFiles);
        }
    }, [value]);

    const buildFilesSignature = (newFiles: File[], attachedFiles: AttachedFile[], deletedFilesList: AttachedFile[]) => {
        const newFilesNames = (newFiles || []).map((f) => f.name).join("|");
        const attachedFileNames = (attachedFiles || []).map((f) => f.name || f.fileName || "").join("|");
        const deletedFileNames = (deletedFilesList || []).map((f) => f.name || f.fileName || "").join("|");
        return `${newFilesNames}::${attachedFileNames}::${deletedFileNames}`;
    };

    const initialSignature = buildFilesSignature(files, responseFiles, deletedFiles);
    const lastEmittedSignatureRef = useRef<string>(initialSignature);

    useEffect(() => {
        const currentSignature = buildFilesSignature(files, responseFiles, deletedFiles);
        if (currentSignature === lastEmittedSignatureRef.current) return;
        lastEmittedSignatureRef.current = currentSignature;

        const payload: FileCellEditorValue = {
            files: {
                newFiles: files,
                attachedFiles: responseFiles,
            },
            deletedFiles: deletedFiles,
        };
        const hasAnyFiles = (files?.length || 0) + (responseFiles?.length || 0) > 0;
        const isValid = !(isRequired && !hasAnyFiles);
        onChange(payload, isValid);
    }, [files, responseFiles, deletedFiles, isRequired, onChange]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const deleteNewFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
    };

    const deleteAttachedFile = (file: AttachedFile, index: number) => {
        setResponseFiles((prevFiles) => prevFiles.filter((_: any, idx: number) => idx !== index));
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
            <StyledDropzone {...getRootProps()} $isDragActive={isDragActive}>
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

            {responseFiles && responseFiles.length > 0 && (
                <Box>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>קבצים קיימים:</Typography>
                    <StyledFilesContainer>
                        {responseFiles.map((file: AttachedFile, index: number) => (
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
                </Box>
            )}
            {errorMessage && (
                <div style={{ color: "#d32f2f", fontSize: "0.75rem" }}>{errorMessage}</div>
            )}
        </StyledContainer>
    );
};
