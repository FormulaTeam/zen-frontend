import React from "react";
import SearchAndFilter from "../SearchAndFilter/SearchAndFilter";

interface SearchInfoProps {
  search?: string;
  setSearch?: (value: string) => void;
  allResponsesCount?: number;
}

const SearchInfo: React.FC<SearchInfoProps> = ({ search, setSearch, allResponsesCount }) => {
  return (
    <SearchAndFilter
      searchValue={search || ""}
      handleSearch={setSearch ? (newValue) => setSearch(newValue || "") : () => {}}
      placeholder="חיפוש תגובה"
    />
  );
};

export default SearchInfo;
