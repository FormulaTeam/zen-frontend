import React, { useEffect, useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface ListCellEditorProps {
    value: string[];
    onChange: (value: string[]) => void;
    isRequired?: boolean;
}

export const ListCellEditor: React.FC<ListCellEditorProps> = ({
    value,
    onChange,
    isRequired = false,
}) => {
    const [localValue, setLocalValue] = useState<string[]>(
        Array.isArray(value) ? value : []
    );

    useEffect(() => {
        setLocalValue(Array.isArray(value) ? value : []);
    }, [value]);

    const handleItemChange = (index: number, newValue: string) => {
        const updated = [...localValue];
        updated[index] = newValue;
        setLocalValue(updated);
        onChange(updated);
    };

    const handleAddItem = () => {
        const updated = [...localValue, ""];
        setLocalValue(updated);
        onChange(updated);
    };

    const handleRemoveItem = (index: number) => {
        const updated = localValue.filter((_, i) => i !== index);
        setLocalValue(updated);
        onChange(updated);
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
                maxHeight: "120px",
                overflowY: "auto",
            }}
            onKeyDown={handleKeyDown}
        >
            {localValue.map((item, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                        size="small"
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        variant="standard"
                        fullWidth
                        autoFocus={index === 0}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: "0.9rem" },
                        }}
                    />
                    <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        sx={{ padding: "4px" }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}
            <IconButton
                size="small"
                onClick={handleAddItem}
                sx={{ alignSelf: "flex-start", padding: "4px" }}
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};
