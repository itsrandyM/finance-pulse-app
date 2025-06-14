
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BudgetBreakdownChartProps {
  totalSpent: number;
  remainingBudget: number;
  unallocatedBudget: number;
  formatCurrency: (amount: number) => string;
}

const BudgetBreakdownChart: React.FC<BudgetBreakdownChartProps> = ({
  totalSpent,
  remainingBudget,
  unallocatedBudget,
  formatCurrency
}) => {
  const categoryBreakdown = [
    { name: 'Spent', value: totalSpent, color: '#ef4444' },
    { name: 'Remaining', value: Math.max(0, remainingBudget), color: '#22c55e' },
    { name: 'Unallocated', value: Math.max(0, unallocatedBudget), color: '#94a3b8' }
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {categoryBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetBreakdownChart;
