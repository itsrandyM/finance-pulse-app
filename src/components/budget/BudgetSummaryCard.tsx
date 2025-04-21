
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
      </CardContent>
    </Card>
  );
};

export default BudgetSummaryCard;
