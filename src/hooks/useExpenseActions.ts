
import { useState } from 'react';
import { addExpense as serviceAddExpense } from '@/services/expenseService';
import { useLoading } from '@/contexts/LoadingContext';

interface UseExpenseActionsProps {
  toast: any;
  loadBudget: () => Promise<boolean>;
}

export const useExpenseActions = ({
  toast,
  loadBudget
}: UseExpenseActionsProps) => {
  const { setIsLoading } = useLoading();

  const addExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      setIsLoading(true);
      console.log(`Adding expense: itemId=${itemId}, amount=${amount}, subItemIds=${subItemIds?.join(',')}`);
      
      if (subItemIds && subItemIds.length > 0) {
        await serviceAddExpense(itemId, amount, subItemIds);
      } else {
        await serviceAddExpense(itemId, amount);
      }
      
      console.log("Expense added successfully, reloading budget data...");
      
      await loadBudget();
      console.log("Budget data reloaded after expense addition");
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { addExpense };
};
