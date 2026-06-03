import { MenuItem, SelectChangeEvent } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
      <StyledSelect
        id="main-sort-select"
        value={sortValue}
        onChange={handleChange}
        inputProps={{ "data-testid": dataTestId }}
        IconComponent={KeyboardArrowDownIcon}
      >
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
