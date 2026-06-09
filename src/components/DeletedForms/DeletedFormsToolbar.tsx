import React from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, FilterList as FilterListIcon, Sort as SortIcon } from "@mui/icons-material";
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
      alignItems="center"
      mb={3}
      mt={1}
      gap={3}
      flexWrap="wrap"
      sx={{
        backgroundColor: "background.paper",
        padding: "12px 24px",
        borderRadius: "12px",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.02)",
      }}>
      {allowSearch && (
        <Box flex={1} minWidth="250px">
          <SearchAndFilter
            variant="standard"
            placeholder="חפש תגובה שנמחקה"
            searchValue={searchValue ?? ""}
            handleSearch={handleSearch ?? (() => { })}
            borderType=""
          />
        </Box>
      )}

      <Box display="flex" gap={3} alignItems="center" flexWrap="wrap" ml="auto">
        <Box display="flex" gap={2} alignItems="center">
          <FilterListIcon color="action" fontSize="small" />
          <BaseFormInput
            size="small"
            label="נמחק ע״י"
            value={deletedBy}
            onChange={(e) => onDeletedByChange(e.target.value)}
            sx={{ minWidth: 150 }}
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
            size="small"
            label="נוצר ע״י"
            value={createdBy}
            onChange={(e) => onCreatedByChange(e.target.value)}
            sx={{ minWidth: 150 }}
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

        <Box display="flex" gap={1.5} alignItems="center">
          <SortIcon color="action" fontSize="small" />
          <Select
            variant="standard"
            value={String(sortValue)}
            onChange={handleSortChange}
            sx={{ minWidth: 200, fontSize: "0.95rem" }}
            disableUnderline>
            <MenuItem value={7}>לפי זמן המחיקה - מהחדש לישן</MenuItem>
            <MenuItem value={8}>לפי זמן המחיקה - מהישן לחדש</MenuItem>
          </Select>
        </Box>
      </Box>
    </Box>
  );
};

export default DeletedFormsToolbar;
