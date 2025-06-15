
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, DollarSign } from 'lucide-react';
import { BudgetPeriod } from '@/types/budget';

interface BudgetOverviewCardsProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  spentPercentage: number;
  period: BudgetPeriod;
}

const BudgetOverviewCards: React.FC<BudgetOverviewCardsProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  spentPercentage,
  period
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">Ksh {totalBudget.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground capitalize">
            {period} budget period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">Ksh {totalSpent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {spentPercentage.toFixed(1)}% of budget
          </p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-xl md:text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
            Ksh {remainingBudget.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {remainingBudget < 0 ? 'Over budget' : 'Available to spend'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverviewCards;
