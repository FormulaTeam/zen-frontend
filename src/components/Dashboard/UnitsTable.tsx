import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import ChartFromToPicker from "../Charts/ChartFromToPicker";
import { useStatisticsDateFilter } from "../../hooks/useStatisticsDateFilter";
import { IRetrieveDataType } from "../../types/enums/dashboard";
import { useDashboardStatisticsContext } from "../../contexts/DashboardStatisticsContext";

interface Row {
  id: string;
  upn: string;
  yechidaHatzava: string;
  loginAt: Date;
}

/* sort helper */
const getComparator = (field: keyof Row, asc: boolean) => (a: Row, b: Row) => {
  const v1 = a[field];
  const v2 = b[field];
  if (v1 === v2) return 0;
  return asc ? (v1 > v2 ? 1 : -1) : v1 > v2 ? -1 : 1;
};

const LoginLogsTable: React.FC = () => {
  const [sortField, setSortField] = useState<keyof Row>("loginAt");
  const [asc, setAsc] = useState(false);

  const { getUnitsByRange, mirageUsers } = useDashboardStatisticsContext();

  const { handleDateChange, handleClearRange, range, triggerFetch } =
    useStatisticsDateFilter(getUnitsByRange, async () => {}, IRetrieveDataType.UNITS);

  useEffect(() => {
    triggerFetch();
  }, []);

  useEffect(() => {
    if (range.from || range.to) {
      triggerFetch();
    }
  }, [range, triggerFetch]);

  /* sorted mirageUsers */
  const sortedmirageUsers = useMemo(
    () => [...mirageUsers].sort(getComparator(sortField, asc)),
    [mirageUsers, sortField, asc],
  );

  /* totals per unit */
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    mirageUsers.forEach((r) => map.set(r?.yechidaHatzava, (map.get(r?.yechidaHatzava) ?? 0) + 1));
    return Array.from(map.entries());
  }, [mirageUsers]);

  const onHeaderClick = (field: keyof Row) => {
    if (field === sortField) setAsc(!asc);
    else {
      setSortField(field);
      setAsc(true);
    }
  };

  const header = (label: string, field: keyof Row) => (
    <TableCell
      align="right"
      sx={{ fontWeight: 700, cursor: "pointer" }}
      onClick={() => onHeaderClick(field)}>
      {label}
      {sortField === field ? (asc ? " ↑" : " ↓") : ""}
    </TableCell>
  );

  return (
    <Box dir="rtl" sx={{ display: "flex", flexDirection: "column", minHeight: 200 }}>
      <ChartFromToPicker
        range={range}
        handleDateChange={handleDateChange}
        handleClearRange={handleClearRange}
      />
      <TableContainer component={Paper} sx={{ flex: 1, maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {header("תאריך ושעה", "loginAt")}
              {header("יוזר", "id")}
              {header("יחידה", "yechidaHatzava")}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedmirageUsers.map((row) => (
              <TableRow
                key={`${row.id}-${dayjs(row.loginAt).format("DD/MM/YYYY HH:mm")}`}
                sx={{ "& td": { textAlign: "right" } }}>
                <TableCell>{dayjs(row.loginAt).format("DD/MM/YYYY HH:mm")}</TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row?.yechidaHatzava || "לא ידוע"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          סה״כ לכל יחידה
        </Typography>
        {totals.map(([unit, count]) => (
          <Typography key={unit}>{`${unit}: ${count}`}</Typography>
        ))}
      </Box>
    </Box>
  );
};

export default LoginLogsTable;
