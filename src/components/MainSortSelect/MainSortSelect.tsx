import { MenuItem, SelectChangeEvent } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { sortByOptions } from "../../utils/utils";
import { FormsSortOption, SortDirection, getSortConfigByValue, getSortValueByEnums } from "./sortUtils";
import { StyledFormControl, StyledSelect } from "./styled";

interface MainSortSelectProps {
  sortBy: FormsSortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: FormsSortOption, sortDirection: SortDirection) => void;
  dataTestId?: string;
}

const MainSortSelect = ({ sortBy, sortDirection, onSortChange, dataTestId }: MainSortSelectProps) => {
  const sortValue = getSortValueByEnums(sortBy, sortDirection);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    const config = getSortConfigByValue(value);
    if (config) {
      onSortChange(config.sortBy, config.sortDirection);
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
