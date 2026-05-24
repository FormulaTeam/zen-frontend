import { useState } from "react";
import { sortByOptions, SortOption } from "../../utils/utils";
import { StyledAutocomplete, StyledTextField } from "./styled";
import { formsSortOption, FormsSortOption, sortDirectionOption, SortDirection } from "../../types/enums/filtersAndSorts.enum";

const sortValueToEnums: Record<number, { sortBy: FormsSortOption; sortDirection: SortDirection }> = {
  1: { sortBy: formsSortOption.Name, sortDirection: sortDirectionOption.Ascending },
  2: { sortBy: formsSortOption.Name, sortDirection: sortDirectionOption.Descending },
  5: { sortBy: formsSortOption.CreatedAt, sortDirection: sortDirectionOption.Descending },
  6: { sortBy: formsSortOption.CreatedAt, sortDirection: sortDirectionOption.Ascending },
};

interface MainSortSelectProps {
  onSortChange: (sortBy: FormsSortOption, sortDirection: SortDirection) => void;
  dataTestId?: string;
}

const MainSortSelect: React.FC<MainSortSelectProps> = ({ onSortChange, dataTestId }) => {
  const [sortByOption, setSortByOption] = useState<SortOption | null>(null);

  const handleSortByChange = (event: React.SyntheticEvent, newValue: SortOption | null) => {
    setSortByOption(newValue);

    const sortEnums = sortValueToEnums[newValue?.value ?? 0];
    if (sortEnums) {
      onSortChange(sortEnums.sortBy, sortEnums.sortDirection);
    }
  };

  return (
    <StyledAutocomplete
      isOptionEqualToValue={(option, value) => {
        return option?.label === value?.label;
      }}
      className="sort-by-autocomplete"
      value={sortByOption}
      options={sortByOptions}
      id="sortByAutocomplete"
      onChange={handleSortByChange}
      multiple={false}
      disablePortal
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label="מיון לפי"
          variant="outlined"
          fullWidth
          size="small"
          name="placeholder"
          inputProps={{
            ...params.inputProps,
            "data-testid": dataTestId,
            readOnly: true,
          }}
        />
      )}
    />
  );
};

export default MainSortSelect;
