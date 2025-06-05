
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
      
      console.log("Expense added successfully, updating local state...");
      
      // Update the local budget items state immediately with the new spent amount
      setBudgetItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, spent: result.newSpent }
            : item
        )
      );
      
      console.log("Budget items updated after expense addition");
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
