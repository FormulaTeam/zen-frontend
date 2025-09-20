import React, { useMemo } from "react";
import { PieChart as RoundPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChartProps } from "../../types/interfaces/charts.types";
import { getRandomColors } from "../../utils/charts";

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const colors = useMemo(() => getRandomColors(data.length), [data.length]);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RoundPieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={120} labelLine={false}>
          {data.map((entry, idx) => (
            <Cell key={entry.name} fill={colors[idx]} />
          ))}
        </Pie>
        <Tooltip />
      </RoundPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;
