
import React from 'react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  index?: string;
  categories?: string[];
  valueFormatter?: (value: number | string) => string;
  colors?: string[];
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  index = 'name',
  categories = ['value'],
  valueFormatter = (value) => `${value}`,
  colors = ['#3b82f6', '#0ea5e9', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'],
  className,
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="90%"
            innerRadius="40%"
            paddingAngle={2}
            dataKey={categories[0]}
            nameKey={index}
          >
            {data.map((entry, idx) => (
              <Cell 
                key={`cell-${idx}`} 
                fill={colors[idx % colors.length]} 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => valueFormatter(value)}
            labelFormatter={(label) => {
              const item = data.find(d => d[index as keyof typeof d] === label);
              return item ? item.name : label;
            }}
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
};
