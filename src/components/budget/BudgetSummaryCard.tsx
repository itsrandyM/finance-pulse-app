
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart } from '@/components/ui/piechart';
import { cn } from '@/lib/utils';

interface BudgetSummaryCardProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetItems: Array<{ name: string; amount: number }>;
  formatCurrency: (value: number) => string;
}

const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  budgetItems,
  formatCurrency,
}) => {
  const spentPercentage = (totalSpent / totalBudget) * 100;
  const isOverBudget = remainingBudget < 0;

  const chartData = budgetItems.map(item => ({
    name: item.name,
    value: item.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-finance-text">Budget Summary</CardTitle>
        <CardDescription>
          Total Budget: {formatCurrency(totalBudget)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent: {formatCurrency(totalSpent)}</span>
            <span className={cn(isOverBudget ? "text-finance-danger" : "text-finance-accent")}>
              Remaining: {isOverBudget ? "-" : ""}{formatCurrency(Math.abs(remainingBudget))}
            </span>
          </div>
          <Progress 
            value={spentPercentage > 100 ? 100 : spentPercentage} 
            className={cn(
              "h-2",
              spentPercentage > 90 ? 'bg-finance-danger' : 
              spentPercentage > 70 ? 'bg-finance-warning' : 
              'bg-finance-accent'
            )} 
          />
        </div>

        {budgetItems.length > 0 && (
          <div className="mt-6">
            <div className="aspect-square max-w-xs mx-auto">
              <PieChart
                data={chartData}
                index="name"
                categories={['value']}
                valueFormatter={(value) => formatCurrency(value as number)}
                colors={['#3b82f6', '#0ea5e9', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899']}
                className="h-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetSummaryCard;
