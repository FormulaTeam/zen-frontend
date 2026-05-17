import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const Chrome90RTLFixContainer = styled(Box)(({ theme }) => ({
  "& .MuiInputBase-input": {
    textAlign: "right",
  },
}));
