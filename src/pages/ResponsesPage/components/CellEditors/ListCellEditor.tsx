import React, { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { preventEnterKeyNavigation } from "../../../../utils/utils";

interface ListCellEditorProps {
  value: string[];
  onChange: (value: string[], isValid?: boolean) => void;
  isRequired?: boolean;
  errorMessage?: string;
}

const getInputSx = ({ hasError }: { hasError: boolean }) => ({
  "& .MuiInputBase-root": {
    minHeight: 40,
    borderRadius: "10px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : "#d7deea",
    backgroundColor: "#ffffff",
    padding: "0 10px",
    fontSize: "1rem",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: hasError ? "#d32f2f" : "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "#d32f2f" : "#7c9cc9",
      boxShadow: hasError
        ? "0 0 0 3px rgba(211, 47, 47, 0.14)"
        : "0 0 0 3px rgba(124, 156, 201, 0.16)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    padding: "7px 0 !important",
    fontSize: "1rem",
    direction: "rtl",
    textAlign: "right",
    color: "#0f172a",
  },
});

const iconButtonSx = {
  width: 28,
  height: 28,
  color: "#64748b",
  borderRadius: "8px",
  padding: 0,

  "&:hover": {
    backgroundColor: "#eef4ff",
    color: "#334155",
  },

  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

const listItemSx = {
  width: "100%",
  minHeight: 34,
  borderRadius: "9px",
  backgroundColor: "#eef4ff",
  border: "1px solid #d4e3ff",
  px: "8px",
  py: "5px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "flex-start",
  gap: "6px",
  direction: "rtl",
};

export const ListCellEditor: React.FC<ListCellEditorProps> = ({
  value,
  onChange,
  isRequired = false,
  errorMessage,
}) => {
  const [listItems, setListItems] = useState<string[]>(Array.isArray(value) ? value : []);
  const [newItemValue, setNewItemValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const newItemInputRef = useRef<HTMLInputElement>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setListItems(Array.isArray(value) ? value : []);
  }, [value]);

  useEffect(() => {
    if (editingIndex !== null) {
      window.setTimeout(() => {
        editingInputRef.current?.focus();
      }, 0);
    }
  }, [editingIndex]);

  const notifyChange = (updated: string[]) => {
    onChange(updated, !(isRequired && updated.length === 0));
  };

  const handleAddItem = () => {
    const trimmedValue = newItemValue.trim();

    if (!trimmedValue) {
      return;
    }

    const updated = [...listItems, trimmedValue];

    setListItems(updated);
    setNewItemValue("");
    notifyChange(updated);

    window.setTimeout(() => {
      newItemInputRef.current?.focus();
    }, 0);
  };

  const handleRemoveItem = (index: number) => {
    const updated = listItems.filter((_, currentIndex) => currentIndex !== index);

    setListItems(updated);
    notifyChange(updated);

    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditingValue(listItems[index] ?? "");
  };

  const handleSaveEdit = (index: number) => {
    const trimmedValue = editingValue.trim();
    const updated = [...listItems];

    if (!trimmedValue) {
      updated.splice(index, 1);
    } else {
      updated[index] = trimmedValue;
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

  const handleNewItemKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      handleAddItem();
      return;
    }

    preventEnterKeyNavigation(event);
  };

  const handleEditKeyDown =
    (index: number): React.KeyboardEventHandler<HTMLDivElement> =>
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        handleSaveEdit(index);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        handleCancelEdit();
        return;
      }

      preventEnterKeyNavigation(event);
    };

  const hasError = !!errorMessage;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
        gap: "8px",
        padding: "6px 8px",
        boxSizing: "border-box",
        direction: "rtl",
      }}>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "6px",
          alignItems: "center",
        }}>
        <TextField
          fullWidth
          placeholder="הוספת פריט"
          value={newItemValue}
          onChange={(event) => setNewItemValue(event.target.value)}
          onKeyDown={handleNewItemKeyDown}
          inputRef={newItemInputRef}
          error={hasError}
          variant="standard"
          autoFocus
          slotProps={{
            input: {
              disableUnderline: true,
            },
          }}
          sx={getInputSx({ hasError })}
        />

        <Tooltip title="הוספה">
          <span>
            <IconButton
              size="small"
              onClick={handleAddItem}
              disabled={!newItemValue.trim()}
              sx={iconButtonSx}>
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          width: "100%",
          minHeight: 36,
          maxHeight: 150,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          boxSizing: "border-box",
        }}>
        {listItems.length === 0 ? (
          <Box
            sx={{
              minHeight: 34,
              borderRadius: "9px",
              border: "1px dashed #cbd5e1",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.95rem",
              backgroundColor: "#fbfcfe",
            }}>
            אין פריטים
          </Box>
        ) : (
          listItems.map((item, index) => {
            const isEditing = editingIndex === index;

            return (
              <Box key={`${item}-${index}`} sx={listItemSx}>
                {isEditing ? (
                  <>
                    <TextField
                      fullWidth
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      onKeyDown={handleEditKeyDown(index)}
                      inputRef={editingInputRef}
                      error={hasError}
                      variant="standard"
                      slotProps={{
                        input: {
                          disableUnderline: true,
                        },
                      }}
                      sx={getInputSx({ hasError })}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        flexShrink: 0,
                        direction: "ltr",
                      }}>
                      <IconButton
                        size="small"
                        onClick={() => handleSaveEdit(index)}
                        sx={{
                          ...iconButtonSx,
                          color: "#308e63",
                        }}>
                        <CheckIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={handleCancelEdit}
                        sx={{
                          ...iconButtonSx,
                          color: "#a54160",
                        }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box
                      component="span"
                      title={item}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: "0.95rem",
                        lineHeight: 1.35,
                        color: "#0f172a",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        textAlign: "right",
                      }}>
                      {item}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        flexShrink: 0,
                        direction: "ltr",
                      }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditItem(index)}
                        sx={iconButtonSx}>
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        sx={{
                          ...iconButtonSx,
                          color: "#a54160",
                        }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};
