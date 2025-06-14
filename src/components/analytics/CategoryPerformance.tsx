
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetItem } from '@/types/budget';

interface CategoryPerformanceProps {
  budgetItems: BudgetItem[];
  formatCurrency: (amount: number) => string;
}

const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({
  budgetItems,
  formatCurrency
}) => {
  const getSpendingTrend = (item: BudgetItem) => {
    const percentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
    if (percentage > 90) return 'danger';
    if (percentage > 75) return 'warning';
    return 'good';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetItems.map(item => {
            const percentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
            const trend = getSpendingTrend(item);
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {trend === 'danger' && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {trend === 'warning' && (
                      <TrendingDown className="h-4 w-4 text-yellow-500" />
                    )}
                    {trend === 'good' && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm">
                      {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformance;
