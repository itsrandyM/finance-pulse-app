
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BudgetItem } from '@/types/budget';

interface SimpleSpendingProgressProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const SimpleSpendingProgress: React.FC<SimpleSpendingProgressProps> = ({
  budgetItems,
  formatCurrency,
}) => {
  if (budgetItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No budget items found. Create budget items to track your spending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetItems.map((item) => {
            const progressPercent = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
            const isOverBudget = item.spent > item.amount;
            const remaining = item.amount - item.spent;

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(progressPercent, 100)} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs">
                  <span className={`${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget 
                      ? `Over by ${formatCurrency(Math.abs(remaining))}` 
                      : `${formatCurrency(remaining)} remaining`
                    }
                  </span>
                  <span className="text-gray-500">
                    {progressPercent.toFixed(1)}%
                  </span>
                </div>

                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <div key={subItem.id} className="flex justify-between text-xs text-gray-600">
                        <span>• {subItem.name}</span>
                        <span>{formatCurrency(subItem.amount)}</span>
                      </div>
                    ))}
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

export default SimpleSpendingProgress;
