import { Box, useTheme } from "@mui/material";
import React, { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Card({ children }: Props) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        gap: 2,
        display: "flex",
      }}>
      {children}
    </Box>
  );
}
