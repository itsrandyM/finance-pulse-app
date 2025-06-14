
import React from 'react';
import { BudgetItem } from '@/types/budget';
import OverviewCards from './OverviewCards';
import BudgetBreakdownChart from './BudgetBreakdownChart';
import SpendingByCategory from './SpendingByCategory';
import CategoryPerformance from './CategoryPerformance';

interface SimpleAnalyticsDashboardProps {
  budgetItems: BudgetItem[];
  totalBudget: number;
  formatCurrency: (amount: number) => string;
}

const SimpleAnalyticsDashboard: React.FC<SimpleAnalyticsDashboardProps> = ({
  budgetItems,
  totalBudget,
  formatCurrency: formatCurrencyProp
}) => {
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const unallocatedBudget = totalBudget - totalAllocated;

  return (
    <div className="space-y-6">
      <OverviewCards
        budgetItems={budgetItems}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        formatCurrency={formatCurrencyProp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetBreakdownChart
          totalSpent={totalSpent}
          remainingBudget={remainingBudget}
          unallocatedBudget={unallocatedBudget}
          formatCurrency={formatCurrencyProp}
        />

        <SpendingByCategory
          budgetItems={budgetItems}
          formatCurrency={formatCurrencyProp}
        />
      </div>

      <CategoryPerformance
        budgetItems={budgetItems}
        formatCurrency={formatCurrencyProp}
      />
    </div>
  );
};

export default SimpleAnalyticsDashboard;
