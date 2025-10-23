import { useState, useCallback, useMemo } from "react";
import { fetchMonthlyFormsStats, fetchUnitsByRange, fetchStaticStats } from "../api/dashboardApi";
import { IRetrieveDataType, IDashboardStatic } from "../types/enums/dashboard";
import { MonthName } from "../consts/charts";
import { showErrorNotification } from "../utils/utils";
import { ChartData, IMirageUser } from "../types/interfaces/dashboard.types";

export const useDashboardStatistics = () => {
  const [stats, setStats] = useState<Map<IDashboardStatic, number | undefined>>(
    () =>
      new Map([
        [IDashboardStatic.TOTAL_FORMS, undefined],
        [IDashboardStatic.ACTIVE_FORMS, undefined],
        [IDashboardStatic.ZERO_COMMENTS, undefined],
        [IDashboardStatic.DAILY_USERS, undefined],
        [IDashboardStatic.MONTHLY_USERS, undefined],
        [IDashboardStatic.INACTIVE_FORMS, undefined],
      ]),
  );

  const [formsByMonthData, setFormsByMonthData] = useState<ChartData[]>([]);
  const [deletedFormsByMonthData, setDeletedFormsByMonthData] = useState<ChartData[]>([]);
  const [mirageUsers, setMirageUsers] = useState<IMirageUser[]>([]);

  const refreshStats = useCallback(async (year: number = new Date().getUTCFullYear()) => {
    try {
      const staticStats = await fetchStaticStats();
      if (!staticStats) throw new Error("Failed to fetch static statistics");

      setStats((prev) => {
        const next = new Map(prev);
        next.set(IDashboardStatic.TOTAL_FORMS, staticStats.totalCount ?? 0);
        next.set(IDashboardStatic.ZERO_COMMENTS, staticStats.zeroCommentsCount ?? 0);
        next.set(IDashboardStatic.ACTIVE_FORMS, staticStats.activeCount ?? 0);
        next.set(IDashboardStatic.INACTIVE_FORMS, staticStats.inactiveCount ?? 0);
        next.set(IDashboardStatic.DAILY_USERS, staticStats.loginLogs?.dailyUsers ?? 0);
        next.set(IDashboardStatic.MONTHLY_USERS, staticStats.loginLogs?.monthlyUsers ?? 0);
        return next;
      });

      setMirageUsers(staticStats.mirageUsers ?? []);
    } catch (err) {
      console.error("Failed to fetch static stats", err);
      showErrorNotification("שגיאה בטעינת נתוני סטטיסטיקות");
    }

    try {
      const created = await fetchMonthlyFormsStats(year, IRetrieveDataType.CREATED);
      if (!created) return;

      setFormsByMonthData(
        created.map(({ count, month }) => ({
          value: count,
          name: MonthName[month],
        })),
      );
    } catch (err) {
      console.error("Failed to fetch created forms stats", err);
      showErrorNotification("שגיאה בטעינת כמות הטפסים שנוצרו");
    }

    try {
      const deleted = await fetchMonthlyFormsStats(year, IRetrieveDataType.DELETED);
      if (!deleted) return;

      setDeletedFormsByMonthData(
        deleted.map(({ count, month }) => ({
          value: count,
          name: MonthName[month],
        })),
      );
    } catch (err) {
      console.error("Failed to fetch deleted forms stats", err);
      showErrorNotification("שגיאה בטעינת כמות הטפסים שנמחקו");
    }
  }, []);

  const getMonthlyFormsStats = useCallback(
    async (year: number = new Date().getUTCFullYear(), operation: IRetrieveDataType) => {
      try {
        const res = await fetchMonthlyFormsStats(year, operation);
        if (!res) return;

        const mapped = res.map(({ count, month }) => ({
          value: count,
          name: MonthName[month],
        }));

        if (operation === IRetrieveDataType.CREATED) {
          setFormsByMonthData(mapped);
        } else if (operation === IRetrieveDataType.DELETED) {
          setDeletedFormsByMonthData(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch monthly forms stats", err);
        showErrorNotification("שגיאה בטעינת נתוני טפסים לפי חודשים");
      }
    },
    [],
  );

  const getUnitsByRange = useCallback(async (range: { from: string | null; to: string | null }) => {
    try {
      const res = await fetchUnitsByRange(range);
      if (!res) return;
      setMirageUsers(res);
    } catch (err) {
      console.error("Failed to fetch units by range", err);
      showErrorNotification("שגיאה בטעינת נתוני יחידות");
    }
  }, []);

  const serializeMirageUsers = useMemo<ChartData[]>(() => {
    const map = new Map<string, number>();
    mirageUsers.forEach(({ yechidaHatzava }) => {
      const unit = yechidaHatzava ?? "לא ידוע";
      map.set(unit, (map.get(unit) ?? 0) + 1);
    });

    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [mirageUsers]);

  const getFormsChartConfig = (type: IRetrieveDataType) => {
    switch (type) {
      case IRetrieveDataType.DELETED:
        return {
          data: deletedFormsByMonthData,
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
          data: formsByMonthData,
          title: "כמות טפסים שנוצרו לפי חודשים",
          tooltip: "כמות טפסים שנוצרו לפי חודשים",
        };
    }
  };

  const summaryCards = [
    {
      title: "כמות טפסים במערכת",
      value: stats.get(IDashboardStatic.TOTAL_FORMS),
      tooltip: "סך כל הטפסים שקיימים במערכת",
    },
    {
      title: "כמות טפסים פעילים",
      value: stats.get(IDashboardStatic.ACTIVE_FORMS),
      tooltip: "טפסים עם יותר מ־5 תגובות...",
    },
    {
      title: "כמות טפסים ללא תגובות",
      value: stats.get(IDashboardStatic.ZERO_COMMENTS),
      tooltip: "סך כל הטפסים במערכת שאין להם תגובות = 0 תגובות",
    },
    {
      title: "כמות טפסים לא פעילים",
      value: stats.get(IDashboardStatic.INACTIVE_FORMS),
      tooltip: "טפסים שלא נערכה בהם תגובה ב־30 הימים האחרונים",
    },
    {
      title: "משתמשים יומיים",
      value: stats.get(IDashboardStatic.DAILY_USERS),
      tooltip: "כמות המשתמשים הייחודיים שנכנסו היום למערכת",
    },
    {
      title: "משתמשים חודשיים",
      value: stats.get(IDashboardStatic.MONTHLY_USERS),
      tooltip: "כמות המשתמשים הייחודיים שנכנסו החודש למערכת",
    },
  ];

  return {
    stats,
    summaryCards,
    refreshStats,
    getMonthlyFormsStats,
    formsByMonth: formsByMonthData,
    deletedFormsByMonth: deletedFormsByMonthData,
    serializeMirageUsers,
    mirageUsers,
    getFormsChartConfig,
    getUnitsByRange,
  };
};
