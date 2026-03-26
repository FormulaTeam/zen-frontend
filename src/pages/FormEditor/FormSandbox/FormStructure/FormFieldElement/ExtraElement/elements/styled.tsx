import { Box, styled } from "@mui/material";

export const LoaderContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
}));

export const WarningText = styled("h5")({
    width: "100%",
    marginTop: 8,
    gridColumn: "span 4",
});
