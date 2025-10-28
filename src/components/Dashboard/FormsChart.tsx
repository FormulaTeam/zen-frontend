import React, { useMemo } from "react";
import CardContent from "@mui/material/CardContent";
import SectionTitle from "./SectionTitle";
import ColumnChart from "../Charts/ColumnChart";
import PieChart from "../Charts/PieChart";
import ChartYearNavigator from "../Charts/ChartYearNavigator";
import ChartFromToPicker from "../Charts/ChartFromToPicker";
import { IChartType, IRetrieveDataType } from "../../types/enums/dashboard";
import { useTheme } from "@mui/material";
import ReactLoading from "react-loading";
import styled from "styled-components";
import { useStatisticsDateFilter } from "../../hooks/useStatisticsDateFilter";
import { useDashboardStatisticsContext } from "../../contexts/DashboardStatisticsContext";
import { ChartContainer, LoadingOverlay } from "./FormsChart.styled";
import { MonthName } from "../../consts/charts";

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  zoom: 0.9;
  margin-bottom: 12px;
`;

type FormsChartProps = {
  type: IRetrieveDataType;
  chartType: IChartType;
  yearFilter?: boolean;
  dateFilter?: boolean;
};

const FormsChart: React.FC<FormsChartProps> = ({ type, chartType, yearFilter, dateFilter }) => {
  const {
    createdFormsQuery,
    deletedFormsQuery,
    unitsRangeQuery,
    getFormsChartConfig,
    serializeMirageUsers,
  } = useDashboardStatisticsContext();

  const { range, year, nextYear, prevYear, handleDateChange, handleClearRange } =
    useStatisticsDateFilter(
      async () => Promise.resolve(),
      async () => Promise.resolve(),
      type,
    );

  const theme = useTheme();

  const { data, title, tooltip } = useMemo(
    () => getFormsChartConfig(type),
    [type, year, createdFormsQuery.data, deletedFormsQuery.data, serializeMirageUsers],
  );

  const isLoading =
    type === IRetrieveDataType.CREATED
      ? createdFormsQuery.isLoading
      : type === IRetrieveDataType.DELETED
      ? deletedFormsQuery.isLoading
      : unitsRangeQuery.isLoading;

  const filteredColumnData = useMemo(() => {
    if (!data) return [];

    const yearData = data.filter((item: any) => {
      const itemDate = item.date;
      if (!itemDate) return false;
      return itemDate.getFullYear() === year;
    });

    const dataMap = new Map<number, any>();
    yearData.forEach((item: any) => {
      const month = item.date.getMonth();
      dataMap.set(month, item);
    });

    const filledData = Array.from({ length: 12 }, (_, month) => {
      if (dataMap.has(month)) return dataMap.get(month);
      return {
        name: MonthName[month],
        value: 0,
        date: new Date(year, month, 1),
      };
    });

    return filledData.filter((item: any) => {
      const itemDate = item.date;
      if (!itemDate) return true;
      if (range.from && itemDate < new Date(range.from)) return false;
      if (range.to && itemDate > new Date(range.to)) return false;
      return true;
    });
  }, [data, year, range, yearFilter]);

  const filteredPieData = useMemo(() => {
    if (!serializeMirageUsers) return [];
    return serializeMirageUsers.filter((item: any) => {
      const itemDate = item.date;
      if (!itemDate) return true;
      if (range.from && itemDate < new Date(range.from)) return false;
      if (range.to && itemDate > new Date(range.to)) return false;
      return true;
    });
  }, [serializeMirageUsers, range]);

  return (
    <CardContent>
      <SectionTitle tooltip={tooltip}>{title}</SectionTitle>

      {yearFilter && <ChartYearNavigator year={year} nextYear={nextYear} prevYear={prevYear} />}

      {dateFilter && (
        <PickerRow>
          <ChartFromToPicker
            range={range}
            handleDateChange={handleDateChange}
            handleClearRange={handleClearRange}
          />
        </PickerRow>
      )}

      <ChartContainer>
        {isLoading && (
          <LoadingOverlay>
            <ReactLoading type="spinningBubbles" color={theme.palette.primary.main} />
          </LoadingOverlay>
        )}

        {chartType === IChartType.COLUMN ? (
          <ColumnChart data={filteredColumnData} xKey="name" yKey="value" />
        ) : (
          <PieChart data={filteredPieData} />
        )}
      </ChartContainer>
    </CardContent>
  );
};

export default FormsChart;
