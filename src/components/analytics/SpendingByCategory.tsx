
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BudgetItem } from '@/types/budget';

interface SpendingByCategoryProps {
  budgetItems: BudgetItem[];
  formatCurrency: (amount: number) => string;
}

const SpendingByCategory: React.FC<SpendingByCategoryProps> = ({
  budgetItems,
  formatCurrency
}) => {
  const spendingData = budgetItems
    .filter(item => item.spent > 0)
    .map(item => ({
      name: item.name,
      spent: item.spent,
      budget: item.amount,
      percentage: item.amount > 0 ? (item.spent / item.amount) * 100 : 0
    }))
    .sort((a, b) => b.spent - a.spent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingData.slice(0, 6)}>
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name === 'spent' ? 'Spent' : 'Budget'
                ]}
              />
              <Bar dataKey="budget" fill="#e2e8f0" name="budget" />
              <Bar dataKey="spent" fill="#3b82f6" name="spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingByCategory;
