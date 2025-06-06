
import { useState } from 'react';
import { addExpense as serviceAddExpense } from '@/services/expenseService';
import { useLoading } from '@/contexts/LoadingContext';
import * as budgetService from '@/services/budgetService';
import { BudgetItem } from '@/types/budget';

interface UseExpenseActionsProps {
  toast: any;
  loadBudget: () => Promise<boolean>;
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  currentBudgetId: string | null;
  budgetItems: BudgetItem[];
}

export const useExpenseActions = ({
  toast,
  loadBudget,
  setBudgetItems,
  currentBudgetId,
  budgetItems
}: UseExpenseActionsProps) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const addExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      setIsAddingExpense(true);
      console.log(`Adding expense: itemId=${itemId}, amount=${amount}, subItemIds=${subItemIds?.join(',')}`);
      
      const result = await serviceAddExpense(itemId, amount, subItemIds);
      
      console.log("Expense added successfully, reloading budget data...");
      
      // Instead of updating local state, reload the entire budget to ensure consistency
      const reloadSuccess = await loadBudget();
      
      if (reloadSuccess) {
        console.log("Budget data reloaded successfully after expense addition");
      } else {
        console.warn("Failed to reload budget data after expense addition");
        // Fallback: update local state if reload fails
        setBudgetItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { ...item, spent: result.newSpent }
              : item
          )
        );
      }
      
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAddingExpense(false);
    }
  };

  return { addExpense, isAddingExpense };
};
