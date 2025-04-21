
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBudget } from '@/contexts/BudgetContext';
import { DollarSign } from 'lucide-react';
import BudgetSummaryCard from './budget/BudgetSummaryCard';
import ExpenseInputCard from './budget/ExpenseInputCard';
import SpendingProgressCard from './budget/SpendingProgressCard';
import VisualSummaryCard from './budget/VisualSummaryCard';

const ExpenseTracking: React.FC = () => {
  const { 
    budgetItems, 
    totalBudget, 
    addExpense, 
    getTotalSpent,
    getRemainingBudget
  } = useBudget();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BudgetSummaryCard
        totalBudget={totalBudget}
        totalSpent={getTotalSpent()}
        remainingBudget={getRemainingBudget()}
        budgetItems={budgetItems}
        formatCurrency={formatCurrency}
      />

      <ExpenseInputCard
        budgetItems={budgetItems}
        onAddExpense={addExpense}
      />

      {budgetItems.length > 0 ? (
        <SpendingProgressCard
          budgetItems={budgetItems}
          formatCurrency={formatCurrency}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium text-gray-500">No Budget Items</h3>
              <p className="text-sm text-gray-400">
                You need to create budget items before you can track expenses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {budgetItems.length > 0 && (
        <VisualSummaryCard budgetItems={budgetItems} formatCurrency={formatCurrency} />
      )}
    </div>
  );
};

export default ExpenseTracking;
