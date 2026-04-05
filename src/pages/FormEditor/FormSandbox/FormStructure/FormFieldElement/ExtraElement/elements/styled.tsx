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

export const LabelWithIcon = styled("span")(({ theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
}));

export const IconWrapper = styled("span")(({ theme }) => ({
    display: "inline-flex",
    alignItems: "center",
}));

export const CheckboxExtraContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    width: "100%",
}));
