import React, { useMemo, useState } from "react";
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
import { IMirageUser } from "../../types/interfaces/dashboard.types";
import ReactLoading from "react-loading";

const getComparator =
  (field: keyof IMirageUser, asc: boolean) =>
  (a: IMirageUser, b: IMirageUser): number => {
    const v1 = a[field] ?? "";
    const v2 = b[field] ?? "";
    if (v1 === v2) return 0;
    return asc ? (v1 > v2 ? 1 : -1) : v1 > v2 ? -1 : 1;
  };

const UnitsTable: React.FC = () => {
  const [sortField, setSortField] = useState<keyof IMirageUser>("loginAt");
  const [asc, setAsc] = useState(false);

  const { unitsRangeQuery } = useDashboardStatisticsContext();

  const { range, handleDateChange, handleClearRange } = useStatisticsDateFilter(
    async () => Promise.resolve(),
    async () => Promise.resolve(),
    IRetrieveDataType.UNITS,
  );

  const mirageUsers = unitsRangeQuery.data ?? [];
  const isLoading = unitsRangeQuery.isLoading;

  const sortedMirageUsers = useMemo(() => {
    return [...mirageUsers].sort(getComparator(sortField, asc));
  }, [mirageUsers, sortField, asc]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    mirageUsers.forEach((r) => {
      const unit = r.yechidaHatzava ?? "לא ידוע";
      map.set(unit, (map.get(unit) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [mirageUsers]);

  const onHeaderClick = (field: keyof IMirageUser) => {
    if (field === sortField) setAsc(!asc);
    else {
      setSortField(field);
      setAsc(true);
    }
  };

  const header = (label: string, field: keyof IMirageUser) => (
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

      <TableContainer component={Paper} sx={{ flex: 1, maxHeight: 500, position: "relative" }}>
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.6)",
              zIndex: 1,
            }}>
            <ReactLoading type="spinningBubbles" color="#1976d2" />
          </Box>
        )}

        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {header("תאריך ושעה", "loginAt")}
              {header("יוזר", "id")}
              {header("יחידה", "yechidaHatzava")}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedMirageUsers.map((row) => (
              <TableRow
                key={`${row.id}-${row.loginAt ?? "unknown"}`}
                sx={{ "& td": { textAlign: "right" } }}>
                <TableCell>
                  {row.loginAt ? dayjs(row.loginAt).format("DD/MM/YYYY HH:mm") : "לא ידוע"}
                </TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.yechidaHatzava ?? "לא ידוע"}</TableCell>
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

export default UnitsTable;
