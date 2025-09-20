import React from "react";
import { CardsRow, HalfChartCard } from "../../pages/Dashboard/styled";
import CardContent from "@mui/material/CardContent";
import SectionTitle from "./SectionTitle";
import LoginLogsTable from "./UnitsTable";
import FormsChart from "./FormsChart";
import { IChartType, IRetrieveDataType } from "../../types/enums/dashboard";

const ChartsContainer = () => {
  return (
    <CardsRow>
      <HalfChartCard>
        <FormsChart type={IRetrieveDataType.CREATED} chartType={IChartType.COLUMN} yearFilter />
      </HalfChartCard>
      <HalfChartCard>
        <FormsChart type={IRetrieveDataType.DELETED} chartType={IChartType.COLUMN} yearFilter />
      </HalfChartCard>
      <HalfChartCard>
        <CardContent>
          <FormsChart type={IRetrieveDataType.UNITS} chartType={IChartType.PIE} dateFilter />
        </CardContent>
      </HalfChartCard>
      <HalfChartCard sx={{ flex: "1 1 100%" }}>
        <CardContent>
          <SectionTitle
            tooltip={
              "כמות משתמשים שנכנסו למערכת בכל הזמן האחרון ללא כפילויות ועל סמך הכניסה האחרונה"
            }>
            כניסות משתמשים
          </SectionTitle>
          <LoginLogsTable />
        </CardContent>
      </HalfChartCard>
    </CardsRow>
  );
};

export default ChartsContainer;
