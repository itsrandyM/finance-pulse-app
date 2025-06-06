
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
      
      console.log("=== RELOADING BUDGET AFTER EXPENSE ===");
      
      // Force a complete budget reload with a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      const reloadSuccess = await loadBudget();
      
      if (reloadSuccess) {
        console.log("Budget data reloaded successfully after expense addition");
        
        // Verify the change took effect
        setTimeout(() => {
          setBudgetItems(prevItems => {
            const updatedItem = prevItems.find(item => item.id === itemId);
            console.log(`Item after reload: ${updatedItem?.name}, spent=${updatedItem?.spent}`);
            return prevItems; // Just for logging, don't actually change state
          });
        }, 100);
      } else {
        console.warn("Failed to reload budget data after expense addition");
        
        // Fallback: manually update the specific item's spent amount
        console.log("Applying fallback state update");
        setBudgetItems(prevItems => {
          const updatedItems = prevItems.map(item => 
            item.id === itemId 
              ? { ...item, spent: result.newSpent }
              : item
          );
          console.log("Fallback update applied:", updatedItems.find(item => item.id === itemId));
          return updatedItems;
        });
      }
      
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
