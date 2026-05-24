import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Box } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import { sortByOptions } from "../../utils/utils";
import { FormsSortOption, SortDirection, sortValueToEnums } from "./sortUtils";
import { StyledFormControl, StyledSelect } from "./styled";
import { useState } from "react";

interface MainSortSelectProps {
  onSortChange: (sortBy: FormsSortOption, sortDirection: SortDirection) => void;
  dataTestId?: string;
}

const MainSortSelect: React.FC<MainSortSelectProps> = ({ onSortChange, dataTestId }) => {
  const [sortValue, setSortValue] = useState<number>(5); // Default to "מועד יצירה (חדש-ישן)"

  const handleChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setSortValue(value);

    const sortEnums = sortValueToEnums[value];
    if (sortEnums) {
      onSortChange(sortEnums.sortBy, sortEnums.sortDirection);
    }
  };

  return (
    <StyledFormControl size="small" variant="outlined">
      <InputLabel id="main-sort-select-label">מיון לפי</InputLabel>
      <StyledSelect
        labelId="main-sort-select-label"
        id="main-sort-select"
        value={sortValue}
        label="מיון לפי"
        onChange={handleChange}
        inputProps={{ "data-testid": dataTestId }}
        startAdornment={
          <Box sx={{ display: "flex", mr: 1, ml: -0.5, color: "primary.main" }}>
            <SortIcon fontSize="small" />
          </Box>
        }
      >
        {sortByOptions.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ fontSize: "12px" }}>
            {option.label}
          </MenuItem>
        ))}
      </StyledSelect>
    </StyledFormControl>
  );
};

export default MainSortSelect;
