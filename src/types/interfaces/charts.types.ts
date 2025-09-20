export interface DataPoint {
  name?: string;
  value?: number;
  date?: string;
  count?: number;
}

export interface PieChartProps {
  data: DataPoint[];
}

export interface ColumnChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
}
