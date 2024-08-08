import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeSeriesChartProps {
  data: Array<{ date: string; [key: string]: number | string }>;
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const incidentTypes = Object.keys(data[0]).filter(key => key !== 'date' && key !== 'total');
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {incidentTypes.map((type, index) => (
          <Line
            key={type}
            type="monotone"
            dataKey={type}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}