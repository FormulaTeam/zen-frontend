import React, { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getRandomColors } from "../../utils/charts";
import styled from "styled-components";
import { ColumnChartProps } from "../../types/interfaces/charts.types";

const ChartContainer = styled(ResponsiveContainer)`
  zoom: 0.95;
`;

const ColumnChart: React.FC<ColumnChartProps> = ({ data, xKey, yKey }) => {
  const colorsRef = useRef<string[]>([]);

  // Generate colors only if ref is empty or data length changed
  if (colorsRef.current.length !== data.length) {
    colorsRef.current = getRandomColors(data.length);
  }

  return (
    <ChartContainer width="100%" height={480}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} tick={{ fontSize: 16 }} />
        <YAxis tickMargin={30} />
        <Tooltip
          formatter={(value: any) => [`${value}`, "כמות "]}
          labelFormatter={(label: any) => `חודש: ${label}`}
        />
        <Bar dataKey={yKey} barSize={20} fill={colorsRef.current[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};

export default ColumnChart;
