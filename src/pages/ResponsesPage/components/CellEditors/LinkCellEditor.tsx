import React, { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { LinkValue } from "../../../../utils/interfaces";

interface LinkCellEditorProps {
    value: LinkValue | null;
    onChange: (value: LinkValue) => void;
    isRequired?: boolean;
}

export const LinkCellEditor: React.FC<LinkCellEditorProps> = ({
    value,
    onChange,
    isRequired = false,
}) => {
    const [url, setUrl] = useState(value?.link || "");
    const [linkText, setLinkText] = useState(value?.linkTxt || "");
    const [urlError, setUrlError] = useState(false);

    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;

    useEffect(() => {
        setUrl(value?.link || "");
        setLinkText(value?.linkTxt || "");
    }, [value]);

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = event.target.value;
        setUrl(newUrl);

        // Validate URL
        const isValid = newUrl === "" || urlRegex.test(newUrl);
        setUrlError(!isValid && newUrl !== "");

        onChange({ link: newUrl, linkTxt: linkText });
    };

    const handleLinkTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLinkText = event.target.value;
        setLinkText(newLinkText);
        onChange({ link: url, linkTxt: newLinkText });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Stop event propagation to prevent grid navigation
        event.stopPropagation();
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                padding: "8px",
            }}
            onKeyDown={handleKeyDown}
        >
            <TextField
                fullWidth
                placeholder="https://example.co.il"
                value={url}
                onChange={handleUrlChange}
                error={urlError}
                helperText={urlError ? "היפר-קישור לא תקין" : ""}
                variant="standard"
                autoFocus
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        fontSize: "0.9rem",
                        padding: "4px 8px",
                    },
                }}
                sx={{ marginBottom: urlError ? 0 : 1 }}
            />
            <TextField
                fullWidth
                placeholder="טקסט להיפר-קישור"
                value={linkText}
                onChange={handleLinkTextChange}
                variant="standard"
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        fontSize: "0.9rem",
                        padding: "4px 8px",
                    },
                }}
            />
        </Box>
    );
};
