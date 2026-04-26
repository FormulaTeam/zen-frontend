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

const YearLabel = styled(Typography)`
  margin: 0 8px;
  display: inline-block;
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

      <YearLabel variant="h6">
        {year}
      </YearLabel>

      <IconButton size="small" onClick={prevYear}>
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>
    </NavigatorWrapper>
  );
};

export default ChartYearNavigator;
