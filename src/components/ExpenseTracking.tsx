
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBudget } from '@/contexts/BudgetContext';
import { DollarSign } from 'lucide-react';
import BudgetSummaryCard from './budget/BudgetSummaryCard';
import ExpenseInputCard from './budget/ExpenseInputCard';
import SpendingProgressCard from './budget/SpendingProgressCard';
import VisualSummaryCard from './budget/VisualSummaryCard';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';

const ExpenseTracking: React.FC = () => {
  const { 
    budgetItems, 
    totalBudget, 
    addExpense, 
    getTotalSpent,
    getRemainingBudget,
    loadBudget
  } = useBudget();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Ensure we have the latest budget data when the component mounts
  useEffect(() => {
    loadBudget().catch(error => {
      console.error("Failed to load budget data:", error);
    });
  }, [loadBudget]);

  // Function to handle expense addition
  const handleAddExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      setIsRefreshing(true);
      
      // Add the expense
      await addExpense(itemId, amount, subItemIds);
      
      // Reload the budget data to get updated spent amounts
      await loadBudget();
      
      toast({
        title: "Expense Added",
        description: `Expense of ${formatCurrency(amount)} has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
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
        onAddExpense={handleAddExpense}
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
