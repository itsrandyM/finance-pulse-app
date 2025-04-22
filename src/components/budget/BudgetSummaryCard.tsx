
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetSummaryCardProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetItems: Array<{ name: string; amount: number }>;
  formatCurrency: (value: number) => string;
  isRefreshing?: boolean;
}

const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  budgetItems,
  formatCurrency,
  isRefreshing = false,
}) => {
  // Use useMemo to calculate these values only when the dependencies change
  const spentPercentage = useMemo(() => {
    console.log("Calculating spent percentage:", { totalSpent, totalBudget });
    return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  }, [totalSpent, totalBudget]);
  
  const isOverBudget = useMemo(() => {
    return remainingBudget < 0;
  }, [remainingBudget]);

  return (
    <Card className={isRefreshing ? "opacity-75" : ""}>
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
