
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
      console.log(`=== EXPENSE ADDITION START ===`);
      console.log(`Adding expense: itemId=${itemId}, amount=${amount}, subItemIds=${subItemIds?.join(',')}`);
      
      // Find the item before adding expense
      const itemBefore = budgetItems.find(item => item.id === itemId);
      console.log(`Item before expense: ${itemBefore?.name}, spent=${itemBefore?.spent}`);
      
      const result = await serviceAddExpense(itemId, amount, subItemIds);
      console.log("Service response:", result);
      
      // Instead of reloading the entire budget, just update the specific item
      setBudgetItems(prevItems => {
        return prevItems.map(item => 
          item.id === itemId 
            ? { ...item, spent: result.newSpent }
            : item
        );
      });
      
      console.log(`Updated item ${itemId} spent amount to ${result.newSpent}`);
      console.log(`=== EXPENSE ADDITION COMPLETE ===`);
      
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
