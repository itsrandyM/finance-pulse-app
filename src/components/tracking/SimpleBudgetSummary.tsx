
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SimpleBudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  formatCurrency: (value: number) => string;
}

const SimpleBudgetSummary: React.FC<SimpleBudgetSummaryProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  formatCurrency,
}) => {
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-finance-text truncate">Budget Overview</CardTitle>
        <CardDescription className="truncate">
          Total Budget: {formatCurrency(totalBudget)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm font-medium truncate">
              Spent: {formatCurrency(totalSpent)}
            </span>
            <span className={`text-sm font-medium truncate ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              Remaining: {formatCurrency(Math.abs(remainingBudget))}
              {isOverBudget && ' (Over Budget)'}
            </span>
          </div>
          <Progress 
            value={Math.min(spentPercentage, 100)} 
            className="h-3 w-full"
          />
          <div className="text-xs text-gray-500 text-center">
            {spentPercentage.toFixed(1)}% of budget used
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleBudgetSummary;
