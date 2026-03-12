import React, { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { LinkValue } from "../../../../utils/interfaces";
import { preventEnterKeyNavigation } from "../../../../utils/utils";

interface LinkCellEditorProps {
    value: LinkValue | string | null;
    onChange: (value: LinkValue, isValid?: boolean) => void;
    isRequired?: boolean;
    errorMessage?: string;
}

const toLinkValue = (value: LinkValue | string | null): LinkValue | null => {
    if (!value || typeof value !== "object") return null;
    return value;
};

export const LinkCellEditor: React.FC<LinkCellEditorProps> = ({
    value,
    onChange,
    isRequired = false,
    errorMessage,
}) => {
    const linkValue = toLinkValue(value);
    const [url, setUrl] = useState(linkValue?.link || "");
    const [linkText, setLinkText] = useState(linkValue?.linkTxt || "");
    const [urlError, setUrlError] = useState(false);

    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;

    useEffect(() => {
        const lv = toLinkValue(value);
        setUrl(lv?.link || "");
        setLinkText(lv?.linkTxt || "");
    }, [value]);

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = event.target.value;
        setUrl(newUrl);

        // Validate URL
        const isValid = newUrl === "" || urlRegex.test(newUrl);
        setUrlError(!isValid && newUrl !== "");

        const overallValid = !(isRequired && (!newUrl || newUrl === ""));
        onChange({ link: newUrl, linkTxt: linkText }, overallValid);
    };

    const handleLinkTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLinkText = event.target.value;
        setLinkText(newLinkText);
        const overallValid = !(isRequired && (!url || url === ""));
        onChange({ link: url, linkTxt: newLinkText }, overallValid);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                padding: "8px",
            }}
        >
            <TextField
                fullWidth
                placeholder="https://example.co.il"
                value={url}
                onChange={handleUrlChange}
                onKeyDown={(e) => preventEnterKeyNavigation(e)}
                error={urlError}
                helperText={urlError ? "היפר-קישור לא תקין" : ""}
                variant="standard"
                autoFocus
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        fontSize: "1rem",
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
                onKeyDown={(e) => preventEnterKeyNavigation(e)}
                variant="standard"
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        fontSize: "1rem",
                        padding: "4px 8px",
                    },
                }}
            />
            {errorMessage && (
                <div style={{ color: "#d32f2f", fontSize: "0.75rem", marginTop: 4 }}>{errorMessage}</div>
            )}
        </Box>
    );
};
