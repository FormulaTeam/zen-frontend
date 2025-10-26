import { useMemo } from "react";
import { IRetrieveDataType, IDashboardStatic } from "../types/enums/dashboard";
import { MonthName } from "../consts/charts";
import { ChartData } from "../types/interfaces/dashboard.types";
import { staticStats, monthlyFormsStats, unitsByRange } from "../api/dashboardApi";

export const useDashboardStatistics = (year = new Date().getUTCFullYear()) => {
  const staticStatsQuery = staticStats();

  const createdFormsQuery = monthlyFormsStats(year, IRetrieveDataType.CREATED);
  const deletedFormsQuery = monthlyFormsStats(year, IRetrieveDataType.DELETED);

  const unitsRangeQuery = unitsByRange({ from: null, to: null });

  const summaryCards = useMemo(() => {
    const stats = staticStatsQuery.data;
    if (!stats) return [];

    return [
      {
        title: "כמות טפסים במערכת",
        value: stats.totalForms ?? 0,
        tooltip: "סך כל הטפסים שקיימים במערכת",
      },
      {
        title: "כמות טפסים פעילים",
        value: stats.activeForms ?? 0,
        tooltip: "טפסים עם יותר מ־5 תגובות...",
      },
      {
        title: "כמות טפסים ללא תגובות",
        value: stats.zeroResponsesCount ?? 0,
        tooltip: "סך כל הטפסים במערכת שאין להם תגובות = 0 תגובות",
      },
      {
        title: "כמות טפסים לא פעילים",
        value: stats.inactiveForms ?? 0,
        tooltip: "טפסים שלא נערכה בהם תגובה ב־30 הימים האחרונים",
      },
      {
        title: "משתמשים יומיים",
        value: stats.dailyUsers ?? 0,
        tooltip: "כמות המשתמשים הייחודיים שנכנסו היום למערכת",
      },
      {
        title: "משתמשים חודשיים",
        value: stats.monthlyUsers ?? 0,
        tooltip: "כמות המשתמשים הייחודיים שנכנסו החודש למערכת",
      },
    ];
  }, [staticStatsQuery.data]);

  const formsByMonth = useMemo<ChartData[]>(() => {
    if (!createdFormsQuery.data) return [];
    return createdFormsQuery.data.map(({ month, count }) => ({
      name: MonthName[month],
      value: count,
    }));
  }, [createdFormsQuery.data]);

  const deletedFormsByMonth = useMemo<ChartData[]>(() => {
    if (!deletedFormsQuery.data) return [];
    return deletedFormsQuery.data.map(({ month, count }) => ({
      name: MonthName[month],
      value: count,
    }));
  }, [deletedFormsQuery.data]);

  const serializeMirageUsers = useMemo<ChartData[]>(() => {
    if (!unitsRangeQuery.data) return [];
    const map = new Map<string, number>();
    unitsRangeQuery.data.forEach(({ yechidaHatzava }) => {
      const unit = yechidaHatzava ?? "לא ידוע";
      map.set(unit, (map.get(unit) ?? 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [unitsRangeQuery.data]);

  const getFormsChartConfig = (type: IRetrieveDataType) => {
    switch (type) {
      case IRetrieveDataType.DELETED:
        return {
          data: deletedFormsByMonth,
          title: "כמות טפסים שנמחקו לפי חודשים",
          tooltip: "כמות טפסים שנמחקו לפי חודשים",
        };
      case IRetrieveDataType.UNITS:
        return {
          data: serializeMirageUsers,
          title: "כמות משתמשים לפי יחידה",
          tooltip: "כמות משתמשים לפי יחידות שנכנסו למערכת ללא כפילויות ועל סמך הכניסה האחרונה",
        };
      case IRetrieveDataType.CREATED:
      default:
        return {
          data: formsByMonth,
          title: "כמות טפסים שנוצרו לפי חודשים",
          tooltip: "כמות טפסים שנוצרו לפי חודשים",
        };
    }
  };

  return {
    staticStatsQuery,
    createdFormsQuery,
    deletedFormsQuery,
    unitsRangeQuery,
    summaryCards,
    formsByMonth,
    deletedFormsByMonth,
    serializeMirageUsers,
    getFormsChartConfig,
  };
};
