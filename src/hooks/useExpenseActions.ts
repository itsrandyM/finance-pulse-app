
import { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import * as expenseService from '@/services/expenseService';

interface UseExpenseActionsProps {
  toast: any;
  loadBudget: () => Promise<void>; // Changed from Promise<boolean> to Promise<void>
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
    if (!currentBudgetId) {
      toast({
        title: "Error adding expense",
        description: "No current budget found",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingExpense(true);
      // For now, we only handle the first sub-item to align with the simplified UI.
      const subItemId = subItemIds && subItemIds.length > 0 ? subItemIds[0] : undefined;
      
      console.log('Adding expense to item:', itemId, 'Amount:', amount, 'SubItem:', subItemId);
      
      await expenseService.addExpense(itemId, amount, subItemId);
      console.log('Expense added successfully, reloading budget...');
      
      // Reload the budget to get updated spent amounts
      await loadBudget();
      
    } catch (error: any) {
      console.error('Error adding expense:', error);
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

  return {
    addExpense,
    isAddingExpense
  };
};
