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
    maxWidth: "1200px",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 0),
}));

export const ResponseTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingBottom: theme.spacing(0.5),
}));

export const ResponseCell = styled(TableCell)<TableCellProps>(() => ({
    textAlign: "start",
    padding: "8px 12px",
    fontSize: "0.9rem",
    "&:first-of-type": {
        width: '80px',
    },
}));

interface StyledTableProps extends TableProps {
    isInEditMode?: boolean;
}

export const StyledTable = styled(Table, {
    shouldForwardProp: (prop) => prop !== 'isInEditMode',
})<StyledTableProps>(({ isInEditMode }) => ({
    "& .MuiTableHead-root .MuiTableCell-root": {
        fontWeight: 700,
        backgroundColor: "#ffffff",
        color: "#1e293b",
        borderBottom: "2px solid #e2e8f0",
    },
    "& .MuiTableBody-root .MuiTableRow-root": {
        backgroundColor: "#ffffff",
        "&:hover": {
            backgroundColor: "#f8fafc",
        },
    },
    ...(isInEditMode && {
        "& .MuiTableCell-root": {
            border: "1px solid #e2e8f0",
        },
    }),
}));
