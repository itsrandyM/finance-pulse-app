
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
}

export const useExpenseActions = ({
  toast,
  loadBudget,
  setBudgetItems,
  currentBudgetId
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
      
      console.log("Expense added successfully, updating item data...");
      
      // Instead of full reload, just update the relevant budget item
      if (currentBudgetId) {
        const items = await budgetService.getBudgetItems(currentBudgetId);
        
        const processedItems: BudgetItem[] = items.map((item: any) => {
          const subItems = item.sub_items.map((subItem: any) => ({
            id: subItem.id,
            name: subItem.name,
            amount: subItem.amount,
            note: subItem.note || undefined,
            tag: subItem.tag || null,
            hasExpenses: subItem.id && subItemIds?.includes(subItem.id) ? true : undefined
          }));
          
          return {
            id: item.id,
            name: item.name,
            amount: item.amount,
            spent: item.spent,
            subItems: subItems,
            deadline: item.deadline ? new Date(item.deadline) : undefined,
            isImpulse: item.is_impulse || false,
            isContinuous: item.is_continuous || false,
            note: item.note || undefined,
            tag: item.tag || null,
          };
        });
        
        setBudgetItems(processedItems);
      }
      
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
      setIsLoading(false);
    }
  };

  return { addExpense };
};
