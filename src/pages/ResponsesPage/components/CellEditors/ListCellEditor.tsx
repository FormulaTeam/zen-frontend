import React, { useEffect, useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { preventEnterKeyNavigation } from "../../../../utils/utils";
import { CellErrorText } from "../../styled";

interface ListCellEditorProps {
    value: string[];
    onChange: (value: string[], isValid?: boolean) => void;
    isRequired?: boolean;
    errorMessage?: string;
}

export const ListCellEditor: React.FC<ListCellEditorProps> = ({
    value,
    onChange,
    isRequired = false,
    errorMessage,
}) => {
    const [listItems, setListItems] = useState<string[]>(Array.isArray(value) ? value : []);
    const [newItemValue, setNewItemValue] = useState<string>("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");

    useEffect(() => {
        setListItems(Array.isArray(value) ? value : []);
    }, [value]);

    const notifyChange = (updated: string[]): void => {
        const isValid: boolean = !(isRequired && updated.length === 0);
        onChange(updated, isValid);
    };

    const handleAddItem = () => {
        if (newItemValue.trim() === "") {
            return;
        }
        const updated = [...listItems, newItemValue.trim()];
        setListItems(updated);
        setNewItemValue("");
        notifyChange(updated);
    };

    const handleRemoveItem = (index: number) => {
        const updated = listItems.filter((_, i) => i !== index);
        setListItems(updated);
        notifyChange(updated);
        setEditingIndex(null);
    };

    const handleEditItem = (index: number) => {
        setEditingIndex(index);
        setEditingValue(listItems[index]);
    };

    const handleSaveEdit = (index: number) => {
        const updated = [...listItems];
        const trimmed = editingValue.trim();
        if (!trimmed) {
            updated.splice(index, 1);
        } else {
            updated[index] = trimmed;
        }
        setListItems(updated);
        notifyChange(updated);
        setEditingIndex(null);
        setEditingValue("");
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newItemValue.trim() !== "") {
            e.preventDefault();
            handleAddItem();
        } else {
            preventEnterKeyNavigation(e);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                padding: "2px",
                height: "170px",
                overflowY: "auto",
                width: "100%",
            }}
        >
            <Box sx={{ display: "flex" }}>
                <TextField
                    size="small"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    variant="standard"
                    fullWidth
                    autoFocus
                    placeholder="הוספת פריט"
                    slotProps={{
                        input: {
                            disableUnderline: true
                        }
                    }}
                />
                <IconButton
                    size="small"
                    onClick={handleAddItem}
                    disabled={newItemValue.trim() === ""}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>
            {errorMessage && (
                <CellErrorText sx={{ marginTop: '2px' }}>{errorMessage}</CellErrorText>
            )}
            {listItems.map((item, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "3vh" }}>
                    {editingIndex === index ? (
                        <TextField
                            size="small"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveEdit(index);
                                } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                } else {
                                    preventEnterKeyNavigation(e);
                                }
                            }}
                            variant="standard"
                            autoFocus
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                sx: { fontSize: "1rem" },
                            }}
                        />
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <Box sx={{ fontSize: "1.2rem", minWidth: "12px" }}>•</Box>
                            <Box sx={{ fontSize: "1rem", ml: 0.5 }}>{item}</Box>
                        </Box>
                    )}
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        {editingIndex === index ? (
                            <>
                                <IconButton
                                    size="small"
                                    onClick={() => handleSaveEdit(index)}
                                    sx={{ padding: "4px" }}
                                >
                                    <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={handleCancelEdit}
                                    sx={{ padding: "4px" }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditItem(index)}
                                    sx={{ padding: "4px" }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleRemoveItem(index)} sx={{ padding: "4px" }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Box>
            ))}
            {errorMessage && (
                <CellErrorText sx={{ marginTop: 1 }}>{errorMessage}</CellErrorText>
            )}
        </Box>
    );
};