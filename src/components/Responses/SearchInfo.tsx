import React from "react";
import SearchAndFilter from "../SearchAndFilter/SearchAndFilter";

interface SearchInfoProps {
  search?: string;
  setSearch?: (value: string) => void;
  allResponsesCount?: number;
  disabled?: boolean;
}

const SearchInfo: React.FC<SearchInfoProps> = ({ search, setSearch, allResponsesCount, disabled }) => {
  return (
    <SearchAndFilter
      searchValue={search || ""}
      handleSearch={setSearch ? (newValue) => setSearch(newValue || "") : () => {}}
      placeholder="חיפוש תגובה"
      disabled={disabled}
    />
  );
};

export default SearchInfo;
