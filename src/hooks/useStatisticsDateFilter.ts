import { useCallback, useEffect, useState } from "react";

export interface DateRange {
  from: string | null;
  to: string | null;
}

export const useStatisticsDateFilter = (
  getUnitsByRange: (range: DateRange) => Promise<void>,
  getMonthlyFormsStats: (year: number, type: any) => Promise<void> | null,
  type: any,
) => {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);

  const nextYear = useCallback(() => setYear((y) => y + 1), []);
  const prevYear = useCallback(() => setYear((y) => y - 1), []);

  const handleDateChange = useCallback(
    (key: "from" | "to", value: string | null, _valid: boolean | null) => {
      const now = new Date().toISOString();
      if (value && value > now) return;

      setRange((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleClearRange = useCallback(() => {
    setRange({ from: null, to: null });
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await getMonthlyFormsStats(year, type);
      setLoading(false);
    };
    fetch();
  }, [year, getMonthlyFormsStats, type]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await getUnitsByRange(range);
      setLoading(false);
    };
    fetch();
  }, [range, getUnitsByRange]);

  return {
    range,
    year,
    loading,
    nextYear,
    prevYear,
    handleDateChange,
    handleClearRange,
  };
};
