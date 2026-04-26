import React from "react";
import { IconButton, Box, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styled from "styled-components";

const NavigatorWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px; /* mb={1} */
`;

const YearLabel = styled.span`
  margin: 0 8px;
  font-family: "Assistant-Bold", sans-serif;
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 500;
`;

interface ChartYearNavigatorProps {
  year: number;
  nextYear: () => void;
  prevYear: () => void;
}
const ChartYearNavigator: React.FC<ChartYearNavigatorProps> = ({ year, nextYear, prevYear }) => {
  return (
    <NavigatorWrapper>
      <IconButton size="small" onClick={nextYear}>
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      <YearLabel>
        {year}
      </YearLabel>

      <IconButton size="small" onClick={prevYear}>
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>
    </NavigatorWrapper>
  );
};

export default ChartYearNavigator;
