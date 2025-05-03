
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import * as budgetService from '@/services/budgetService';

export const useExpenseActions = (loadBudget: () => Promise<boolean>) => {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const addExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      startLoading("Adding expense...");
      console.log(`Adding expense: itemId=${itemId}, amount=${amount}, subItemIds=${subItemIds?.join(',')}`);
      
      if (subItemIds && subItemIds.length > 0) {
        await budgetService.addExpense(itemId, amount, subItemIds);
      } else {
        await budgetService.addExpense(itemId, amount);
      }
      
      console.log("Expense added successfully, reloading budget data...");
      
      await loadBudget();
      console.log("Budget data reloaded after expense addition");
      
      toast({
        title: "Expense added",
        description: "Your expense has been recorded successfully."
      });
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      stopLoading();
    }
  };

  const updateItemDeadline = async (itemId: string, deadline: Date) => {
    try {
      startLoading("Updating deadline...");
      await budgetService.updateBudgetItem(itemId, { deadline });
      
      toast({
        title: "Deadline updated",
        description: "The item deadline has been set."
      });
      
      // Reload budget to get updated data
      await loadBudget();
    } catch (error: any) {
      toast({
        title: "Error updating deadline",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  return {
    addExpense,
    updateItemDeadline
  };
};
