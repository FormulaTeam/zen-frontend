import { Box, FormControl, styled } from "@mui/material";

export const LoaderContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
    gridColumn: "span 4",
}));

export const Container = styled(FormControl)({
    gridColumn: "span 4",
    width: "40%",
});

export const FieldControl = styled(FormControl)({
    marginTop: 8,
});
