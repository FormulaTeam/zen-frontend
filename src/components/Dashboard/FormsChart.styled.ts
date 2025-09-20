import { Box } from "@mui/material";
import styled from "styled-components";

export const ChartContainer = styled(Box)`
  position: relative;
`;

export const LoadingOverlay = styled(Box)`
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;
