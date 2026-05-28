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
        alignItems: "center",
        gap: 0.75,
        width: "100%",
        height: "100%",
        px: 0.5,
        boxSizing: "border-box",
      }}>
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
            disableUnderline: true,
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            minHeight: 34,
            borderRadius: "8px",
            border: "1px solid #d7deea",
            backgroundColor: "#fff",
            px: 1,
            fontSize: "0.9rem",
          },
        }}
      />

      <IconButton
        size="small"
        onClick={handleAddItem}
        disabled={newItemValue.trim() === ""}
        sx={{ flexShrink: 0 }}>
        <AddIcon fontSize="small" />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          overflowX: "auto",
          maxWidth: "45%",
          whiteSpace: "nowrap",
        }}>
        {listItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.75,
              py: 0.25,
              borderRadius: "999px",
              backgroundColor: "#eef4ff",
              border: "1px solid #d4e3ff",
              fontSize: "0.8rem",
              maxWidth: 140,
            }}>
            <Box
              component="span"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {item}
            </Box>

            <IconButton size="small" onClick={() => handleRemoveItem(index)} sx={{ p: 0 }}>
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
