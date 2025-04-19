
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BudgetItem } from '@/contexts/BudgetContext';

interface SpendingProgressCardProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const SpendingProgressCard: React.FC<SpendingProgressCardProps> = ({
  budgetItems,
  formatCurrency,
}) => {
  const calculateProgress = (spent: number, budgeted: number) => {
    return (spent / budgeted) * 100;
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage < 70) return 'bg-finance-accent';
    if (percentage < 90) return 'bg-finance-warning';
    return 'bg-finance-danger';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Spending Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetItems.map((item) => {
            const progressPercent = calculateProgress(item.spent, item.amount);
            const progressColorClass = getProgressColor(item.spent, item.amount);
            const isOverBudget = item.spent > item.amount;
            
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm">
                    <span className={isOverBudget ? "text-finance-danger" : ""}>
                      {formatCurrency(item.spent)}
                    </span>
                    <span className="text-gray-500"> / {formatCurrency(item.amount)}</span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${progressPercent > 100 ? 100 : progressPercent}%` }}
                      className={cn(
                        "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center",
                        progressColorClass
                      )}
                    ></div>
                  </div>
                </div>
                {isOverBudget && (
                  <div className="text-xs text-finance-danger">
                    Over budget by {formatCurrency(item.spent - item.amount)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingProgressCard;
