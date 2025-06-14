
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

interface BudgetSummaryStats {
  totalBudgets: number;
  totalBudgeted: number;
  totalSpent: number;
  averageUtilization: number;
  completedBudgets: number;
  abandonedBudgets: number;
  overspentBudgets: number;
  totalSaved: number;
  totalOverspent: number;
}

interface BudgetHistorySummaryProps {
  stats: BudgetSummaryStats;
}

const BudgetHistorySummary: React.FC<BudgetHistorySummaryProps> = ({ stats }) => {
  const successRate = stats.totalBudgets > 0 ? 
    ((stats.completedBudgets / stats.totalBudgets) * 100) : 0;

  const netSavings = stats.totalSaved - stats.totalOverspent;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Total Budgets</CardDescription>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {stats.totalBudgets}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {stats.completedBudgets} completed, {stats.abandonedBudgets} abandoned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Success Rate</CardDescription>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {successRate.toFixed(1)}%
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Avg utilization: {stats.averageUtilization.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Total Budgeted</CardDescription>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <span className="truncate" title={formatCurrency(stats.totalBudgeted)}>
              {stats.totalBudgeted >= 1000000 
                ? `${(stats.totalBudgeted / 1000000).toFixed(1)}M`
                : stats.totalBudgeted >= 1000 
                ? `${(stats.totalBudgeted / 1000).toFixed(0)}K`
                : formatCurrency(stats.totalBudgeted)
              }
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Spent: {formatCurrency(stats.totalSpent)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Net Performance</CardDescription>
          <CardTitle className={`text-lg flex items-center gap-2 ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netSavings >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="truncate" title={formatCurrency(Math.abs(netSavings))}>
              {Math.abs(netSavings) >= 1000000 
                ? `${(Math.abs(netSavings) / 1000000).toFixed(1)}M`
                : Math.abs(netSavings) >= 1000 
                ? `${(Math.abs(netSavings) / 1000).toFixed(0)}K`
                : formatCurrency(Math.abs(netSavings))
              }
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {netSavings >= 0 ? 'Total saved' : 'Total overspent'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetHistorySummary;
