import React from "react";
import { Box, Typography } from "@mui/material";
import SearchAndFilter from "../SearchAndFilter/SearchAndFilter";
import styled from "styled-components";

interface SearchInfoProps {
  search: string;
  setSearch: (value: string) => void;
  allResponsesCount: number;
}
export const InfoAndSearchSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const SearchInfo: React.FC<SearchInfoProps> = ({ search, setSearch, allResponsesCount }) => {
  return (
    <InfoAndSearchSection>
      <Box>
        <Typography color="primary" variant="h6">
          כל התגובות
        </Typography>
        <Typography variant="subtitle1">{`כמות תגובות לטופס - ${allResponsesCount}`}</Typography>
      </Box>

      <SearchAndFilter
        searchValue={search}
        handleSearch={(newValue) => setSearch(newValue)}
        placeholder="חיפוש תגובה"
      />
    </InfoAndSearchSection>
  );
};

export default SearchInfo;
