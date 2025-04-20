
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';

interface BudgetAllocationSummaryProps {
  totalBudget: number;
  totalAllocated: number;
  remainingToAllocate: number;
}

const BudgetAllocationSummary: React.FC<BudgetAllocationSummaryProps> = ({
  totalBudget,
  totalAllocated,
  remainingToAllocate,
}) => {
  const allocationPercentage = (totalAllocated / totalBudget) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-finance-text">Budget Allocation</CardTitle>
        <CardDescription>
          Total Budget: {formatCurrency(totalBudget)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Allocated: {formatCurrency(totalAllocated)}</span>
            <span className={remainingToAllocate < 0 ? "text-finance-danger" : "text-finance-accent"}>
              Remaining: {formatCurrency(remainingToAllocate)}
            </span>
          </div>
          <Progress value={allocationPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAllocationSummary;
