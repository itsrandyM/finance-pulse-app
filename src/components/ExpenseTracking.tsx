
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import VisualSummaryCard from './budget/VisualSummaryCard';
import SimpleBudgetSummary from './tracking/SimpleBudgetSummary';
import SimpleExpenseInput from './tracking/SimpleExpenseInput';
import SimpleSpendingProgress from './tracking/SimpleSpendingProgress';

const ExpenseTracking: React.FC = () => {
  const { 
    budgetItems, 
    totalBudget, 
    addExpense,
    getTotalSpent,
    getRemainingBudget,
    loadBudget,
    isLoading
  } = useBudget();
  
  const { toast } = useToast();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Load budget data when component mounts (only once)
  useEffect(() => {
    if (!hasLoadedInitial) {
      const loadData = async () => {
        try {
          await loadBudget();
          setHasLoadedInitial(true);
        } catch (error) {
          console.error("Failed to load budget:", error);
        }
      };
      
      loadData();
    }
  }, [loadBudget, hasLoadedInitial]);

  const handleAddExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      setIsAddingExpense(true);
      console.log('Adding expense:', { itemId, amount, subItemIds });
      
      await addExpense(itemId, amount, subItemIds);
      
      toast({
        title: "Expense Added",
        description: `Expense of ${formatCurrency(amount)} added successfully.`,
      });
      
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive"
      });
    } finally {
      setIsAddingExpense(false);
    }
  };

  if (isLoading && !hasLoadedInitial) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-finance-primary mx-auto mb-4"></div>
          <p>Loading budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SimpleBudgetSummary
        totalBudget={totalBudget}
        totalSpent={getTotalSpent()}
        remainingBudget={getRemainingBudget()}
        formatCurrency={formatCurrency}
      />

      <SimpleExpenseInput
        budgetItems={budgetItems}
        onAddExpense={handleAddExpense}
        isLoading={isAddingExpense}
      />

      <SimpleSpendingProgress
        budgetItems={budgetItems}
        formatCurrency={formatCurrency}
      />

      <VisualSummaryCard 
        budgetItems={budgetItems} 
        formatCurrency={formatCurrency} 
      />
    </div>
  );
};

export default ExpenseTracking;
