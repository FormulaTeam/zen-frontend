import { useState, useEffect } from "react";
import { sortByOptions, SortOption } from "../../utils/utils";
import { Filter, Form } from "../../utils/interfaces";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { StyledAutocomplete, StyledTextField } from "./styled";
import { IOrderBy } from "../../types/enums/filtersAndSorts.enum";

interface MainSortSelectProps {
  setFormsData: React.Dispatch<React.SetStateAction<Form[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  getSortFilter: (newValueInt: number, filter: Filter) => Filter;
  setCurrentFilter: React.Dispatch<React.SetStateAction<Filter | null>>;
}

const MainSortSelect: React.FC<MainSortSelectProps> = ({ setFormsData, setPage, getSortFilter, setCurrentFilter }) => {
  useEffect(() => {}, []);
  const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
  });
  const [sortByOption, setSortByOption] = useState<any>(null);
  const DEFAULT_INPUT_WIDTH = 125;
  const FONT_SIZE = 16;
  const [sortInputWidth, setSortInputWidth] = useState(DEFAULT_INPUT_WIDTH);

  /** set CurrentFilter when pick in sortBy select */
  const handleSortByChange = (event: React.SyntheticEvent, newValue:  SortOption | null) => {
    setFormsData([]);
    setPage(1);
    setSortByOption(newValue);
    let filter: Filter = {
      query: {},
      sortBy: "endBy",
      orderBy: IOrderBy.ASC,
    };

    filter = getSortFilter(newValue?.value || 0, filter);
    setCurrentFilter(filter);

    if (newValue && newValue?.label.length !== 1) {
      setSortInputWidth(Math.max(DEFAULT_INPUT_WIDTH, newValue?.label.length * FONT_SIZE));
    } else {
      setSortInputWidth(DEFAULT_INPUT_WIDTH);
    }
  };

  return (
    <CacheProvider value={cacheRtl}>
      <StyledAutocomplete
        sortInputWidth={sortInputWidth}
        isOptionEqualToValue={(option, value) => {
          return option?.label === value?.label;
        }}
        className="sort-by-autocomplete"
        value={sortByOption}
        options={sortByOptions}
        id="sortByAutocomplete"
        onChange={handleSortByChange}
        multiple={false}
        disablePortal //so options dropdown will show in popup
        getOptionLabel={(option) => option.label}
        style={{ direction: "rtl" }}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            label="מיון לפי"
            variant="outlined"
            fullWidth
            size="small"
            name="placeholder"
            value={sortByOption || ""}
          />
        )}
      />
    </CacheProvider>
  );
};

export default MainSortSelect;
