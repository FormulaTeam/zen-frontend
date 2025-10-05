import { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchMonthlyFormsStats,
  fetchUnitsByRange,
  fetchStaticStats,
} from "../api";
import { IRetrieveDataType, IDashboardStatic } from "../types/enums/dashboard";
import { MonthName } from "../consts/charts";
import { showErrorNotification } from "../utils/utils";

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

  const [formsByMonth, setFormsByMonth] = useState<any[]>([]);
  const [deletedFormsByMonth, setDeletedFormsByMonth] = useState<any[]>([]);
  const [mirageUsers, setMirageUsers] = useState<any[]>([]);

  const refreshStats = useCallback(async (year: number = new Date().getUTCFullYear()) => {
    try {
      const staticStats = await fetchStaticStats();
      if (!staticStats) throw new Error("Failed to fetch static statistics");

      setStats((prev) => {
        const next = new Map(prev);
        next.set(IDashboardStatic.TOTAL_FORMS, staticStats?.totalCount);
        next.set(IDashboardStatic.ZERO_COMMENTS, staticStats?.zeroCommentsCount);
        next.set(IDashboardStatic.ACTIVE_FORMS, staticStats?.activeCount);
        next.set(IDashboardStatic.INACTIVE_FORMS, staticStats?.inactiveCount);
        next.set(IDashboardStatic.DAILY_USERS, staticStats?.loginLogs?.dailyUsers);
        next.set(IDashboardStatic.MONTHLY_USERS, staticStats?.loginLogs?.monthlyUsers);
        return next;
      });

      setMirageUsers(staticStats?.mirageUsers ?? []);
    } catch (err) {
      console.error("Failed to fetch static stats", err);
      showErrorNotification("שגיאה בטעינת נתוני סטטיסטיקות");
    }

    try {
      const created = await fetchMonthlyFormsStats(year, IRetrieveDataType.CREATED);
      if (!created) throw new Error("Failed to fetch created forms statistics");
      setFormsByMonth(
        created?.formsByMonth?.map(({ count, month }) => ({
          count,
          month: MonthName[month],
        })) ?? [],
      );
    } catch (err) {
      console.error("Failed to fetch created forms stats", err);
      showErrorNotification("שגיאה בטעינת כמות הטפסים שנוצרו");
    }

    try {
      const deleted = await fetchMonthlyFormsStats(year, IRetrieveDataType.DELETED);
      if (!deleted) throw new Error("Failed to fetch deleted forms statistics");
      setDeletedFormsByMonth(
        deleted?.deletedFormsByMonth?.map(({ count, month }) => ({
          count,
          month: MonthName[month],
        })) ?? [],
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

        if (res?.formsByMonth) {
          setFormsByMonth(
            res.formsByMonth.map(({ count, month }) => ({
              count,
              month: MonthName[month],
            })),
          );
        }

        if (res?.deletedFormsByMonth) {
          setDeletedFormsByMonth(
            res.deletedFormsByMonth.map(({ count, month }) => ({
              count,
              month: MonthName[month],
            })),
          );
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
      setMirageUsers(res?.mirageUsers ?? []);
    } catch (err) {
      console.error("Failed to fetch units by range", err);
      showErrorNotification("שגיאה בטעינת נתוני יחידות");
    }
  }, []);

  const serializeMirageUsers = useMemo(() => {
    const map = new Map<string, number>();
    mirageUsers.forEach(({ yechidaHatzava = "לא ידוע" }) => {
      map.set(yechidaHatzava, (map.get(yechidaHatzava) ?? 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [mirageUsers]);

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


  const summaryCards = [
    {
      title: "כמות טפסים במערכת",
      value: stats.get(IDashboardStatic.TOTAL_FORMS),
      tooltip: "סך כל הטפסים שקיימים במערכת",
    },
    {
      title: "כמות טפסים פעילים",
      value: stats.get(IDashboardStatic.ACTIVE_FORMS),
      tooltip: "טפסים עם יותר מ־5 תגובות, כשלפחות תגובה אחת נוצרה ב־7 הימים האחרונים",
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
    formsByMonth,
    deletedFormsByMonth,
    serializeMirageUsers,
    mirageUsers,
    getFormsChartConfig,
    getUnitsByRange,
  };
};
