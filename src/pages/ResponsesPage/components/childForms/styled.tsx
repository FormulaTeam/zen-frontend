import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table, { TableProps } from "@mui/material/Table";
import TableCell, { TableCellProps } from "@mui/material/TableCell";
import Typography, { TypographyProps } from "@mui/material/Typography";

export const DetailsRowContainer = styled(Box)<BoxProps>(({ theme }) => ({
    display: "flex",
    alignItems: "start",
    flexDirection: "column",
    width: "100%",
    gap: theme.spacing(1),
}));

export const ResponseTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    color: "inherit",
    display: "flex",
    alignItems: "center",
}));

export const ResponseCell = styled(TableCell)<TableCellProps>(() => ({
    textAlign: "start",
    "&:first-of-type": {
        width: '90px',
    },
}));

interface StyledTableProps extends TableProps {
    isInEditMode?: boolean;
}

export const StyledTable = styled(Table, {
    shouldForwardProp: (prop) => prop !== 'isInEditMode',
})<StyledTableProps>(({ isInEditMode }) => ({
    ...(isInEditMode && {
        "& .MuiTableCell-root": {
            border: "1px solid rgba(224, 224, 224, 1)",
        },
    }),
}));
