import React from "react";
import { Box, IconButton, InputAdornment, TextField, useTheme } from "@mui/material";
import { Close, Search } from "@mui/icons-material";

interface SearchAndFilterProps {
  handleSearch: (value: string) => void;
  placeholder?: string;
  searchValue: string;
  borderType?: "" | "none";
  variant?: "standard" | "outlined" | "filled";
  dataTestId?: string;
  disabled?: boolean;
}
const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  handleSearch,
  placeholder,
  searchValue,
  borderType,
  variant = "outlined",
  dataTestId,
  disabled,
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
        disabled={disabled}
        sx={{
          width: "340px",
          "& .MuiOutlinedInput-root": {
            height: "40px",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "#D1D1D1 !important",
              borderWidth: "1px !important",
            },
            "&:hover fieldset": {
              borderColor: "#62748E !important",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#020618 !important",
              borderWidth: "2px !important",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.12) !important",
              },
            },
          },
        }}
        size="small"
        onKeyUp={handleKeyUp}
        inputProps={{
          "data-testid": dataTestId,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#020618", fontSize: "22px" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {searchValue && (
                <IconButton
                  className="clear-btn"
                  type="reset"
                  size="small"
                  sx={{ color: theme.palette.text.secondary }}
                  onClick={() => handleSearch("")}>
                  <Close sx={{ fontSize: "18px" }} />
                </IconButton>
              )}
            </>
          ),
        }}
      />
    </Box>
  );
};

export default SearchAndFilter;
