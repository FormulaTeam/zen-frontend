import { InputLabel, MenuItem, SelectChangeEvent, Box } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import { useState } from "react";

import { sortByOptions } from "../../utils/utils";
import { FormsSortOption, SortDirection, sortValueToEnums } from "./sortUtils";
import { StyledFormControl, StyledSelect } from "./styled";

interface MainSortSelectProps {
  onSortChange: (sortBy: FormsSortOption, sortDirection: SortDirection) => void;
  dataTestId?: string;
}

const MainSortSelect = ({ onSortChange, dataTestId }: MainSortSelectProps) => {
  const [sortValue, setSortValue] = useState<number>(5);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setSortValue(value);

    const mapped = sortValueToEnums[value];
    if (mapped) {
      onSortChange(mapped.sortBy, mapped.sortDirection);
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
        IconComponent={() => null}
        startAdornment={
          <Box sx={{ display: "flex", mr: 1, ml: -0.5, color: "#020618" }}>
            <SortIcon sx={{ fontSize: "22px" }} />
          </Box>
        }>
        {sortByOptions.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ fontSize: "16px" }}>
            {option.label}
          </MenuItem>
        ))}
      </StyledSelect>
    </StyledFormControl>
  );
};

export default MainSortSelect;
