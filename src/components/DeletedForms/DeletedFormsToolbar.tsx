import React from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import SearchAndFilter from "../SearchAndFilter/SearchAndFilter";
import BaseFormInput from "../BaseFormInput/BaseFormInput";

interface DeletedFormsToolbarProps {
  sortValue: number;
  onSortChange: (value: number) => void;
  deletedBy: string;
  createdBy: string;
  onDeletedByChange: (value: string) => void;
  onCreatedByChange: (value: string) => void;
  allowSearch?: boolean;
  searchValue?: string;
  handleSearch?: (value: string) => void;
}

const DeletedFormsToolbar: React.FC<DeletedFormsToolbarProps> = ({
  sortValue,
  onSortChange,
  deletedBy,
  createdBy,
  onDeletedByChange,
  onCreatedByChange,
  searchValue,
  handleSearch,
  allowSearch,
}) => {
  const handleSortChange = (event: SelectChangeEvent) => {
    const selected = Number(event.target.value);
    onSortChange(selected);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-end"
      mb={2}
      gap={2}
      flexWrap="wrap"
      dir="rtl">
      {allowSearch && (
        <SearchAndFilter
          variant="standard"
          placeholder="חפש תגובה שנמחקה"
          searchValue={searchValue ?? ""}
          handleSearch={handleSearch ?? (() => {})}
          borderType=""
        />
      )}
      <Box display="flex" gap={2}>
        <BaseFormInput
          dir="rtl"
          size="small"
          label="נמחק ע״י"
          value={deletedBy}
          onChange={(e) => onDeletedByChange(e.target.value)}
          InputProps={{
            endAdornment: deletedBy && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onDeletedByChange("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <BaseFormInput
          dir="rtl"
          size="small"
          label="נוצר ע״י"
          value={createdBy}
          onChange={(e) => onCreatedByChange(e.target.value)}
          InputProps={{
            endAdornment: createdBy && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onCreatedByChange("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box display="flex" gap={2} alignItems="center">
        <Select
          variant="standard"
          value={String(sortValue)}
          onChange={handleSortChange}
          sx={{ minWidth: 200 }}>
          <MenuItem value={7}>לפי זמן המחיקה - מהחדש לישן</MenuItem>
          <MenuItem value={8}>לפי זמן המחיקה - מהישן לחדש</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default DeletedFormsToolbar;
