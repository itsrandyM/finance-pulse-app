
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { BudgetItem } from '@/types/budget';

interface OverviewCardsProps {
  budgetItems: BudgetItem[];
  totalBudget: number;
  totalSpent: number;
  formatCurrency: (amount: number) => string;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({
  budgetItems,
  totalBudget,
  totalSpent,
  formatCurrency
}) => {
  const onTrackItems = budgetItems.filter(item => {
    const percentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
    return percentage <= 75;
  }).length;

  const overBudgetItems = budgetItems.filter(item => item.spent > item.amount).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Utilization</p>
              <p className="text-2xl font-bold">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </p>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Items On Track</p>
              <p className="text-2xl font-bold text-green-600">{onTrackItems}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Over Budget</p>
              <p className="text-2xl font-bold text-red-600">{overBudgetItems}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground mb-1">Avg. Spending</p>
              <p className="text-lg font-bold break-words">
                {budgetItems.length > 0 
                  ? formatCurrency(totalSpent / budgetItems.length)
                  : formatCurrency(0)
                }
              </p>
            </div>
            <Calendar className="h-6 w-6 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
