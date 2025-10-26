import React, { useMemo } from "react";
import CardContent from "@mui/material/CardContent";
import SectionTitle from "./SectionTitle";
import ColumnChart from "../Charts/ColumnChart";
import ChartYearNavigator from "../Charts/ChartYearNavigator";
import { IChartType, IRetrieveDataType } from "../../types/enums/dashboard";
import { useTheme } from "@mui/material";
import ReactLoading from "react-loading";
import { ChartContainer, LoadingOverlay } from "./FormsChart.styled";
import PieChart from "../Charts/PieChart";
import ChartFromToPicker from "../Charts/ChartFromToPicker";
import styled from "styled-components";
import { useStatisticsDateFilter } from "../../hooks/useStatisticsDateFilter";
import { useDashboardStatisticsContext } from "../../contexts/DashboardStatisticsContext";

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
    [type, createdFormsQuery.data, deletedFormsQuery.data, serializeMirageUsers],
  );

  const isLoading =
    type === IRetrieveDataType.CREATED
      ? createdFormsQuery.isLoading
      : type === IRetrieveDataType.DELETED
      ? deletedFormsQuery.isLoading
      : unitsRangeQuery.isLoading;

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
          <ColumnChart data={data} xKey="name" yKey="value" />
        ) : (
          <PieChart data={serializeMirageUsers} />
        )}
      </ChartContainer>
    </CardContent>
  );
};

export default FormsChart;
