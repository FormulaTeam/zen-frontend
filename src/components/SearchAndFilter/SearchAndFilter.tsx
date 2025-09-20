import React from "react";
import { Box, IconButton, InputAdornment, TextField, useTheme } from "@mui/material";
import { Close, Search } from "@mui/icons-material";

interface SearchAndFilterProps {
  handleSearch: (value: string) => void;
  placeholder?: string;
  searchValue: string;
  borderType?: "" | "none";
  variant?: "standard" | "outlined" | "filled";
}
const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  handleSearch,
  placeholder,
  searchValue,
  borderType,
  variant = "outlined",
}) => {
  const theme = useTheme();

  const handleKeyUp = (e: any) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    }
  };

  return (
    <Box>
      <TextField
        variant={variant}
        placeholder={placeholder}
        value={searchValue}
        onChange={(e: any) => handleSearch(e?.target?.value || "")}
        sx={{
          width: "350px",
          "& .MuiOutlinedInput-root, & fieldset": {
            border: borderType ? borderType : "none",
            borderRadius: "6px",
          },
        }}
        size="small"
        onKeyUp={handleKeyUp}
        InputProps={{
          endAdornment: (
            <>
              {searchValue && (
                <IconButton
                  className="clear-btn"
                  type="reset"
                  size="small"
                  sx={{ color: theme.palette.text.secondary }}
                  onClick={() => handleSearch("")}>
                  <Close />
                </IconButton>
              )}
              <InputAdornment position="end">
                <Search sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            </>
          ),
        }}
      />
    </Box>
  );
};

export default SearchAndFilter;
