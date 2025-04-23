import { useState } from 'react';
import { BudgetItem, SubBudgetItem } from '@/types/budget';
import * as budgetService from '@/services/budgetService';

interface UseBudgetOperationsProps {
  currentBudgetId: string | null;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  toast: any;
  loadBudget: () => Promise<boolean>;
}

export const useBudgetOperations = ({
  currentBudgetId,
  budgetItems,
  setBudgetItems,
  toast,
  loadBudget
}: UseBudgetOperationsProps) => {
  
  const addBudgetItem = async (name: string, amount: number, isImpulse: boolean = false) => {
    if (!currentBudgetId) {
      toast({
        title: "Error adding budget item",
        description: "No current budget found",
        variant: "destructive"
      });
      return;
    }

    try {
      const newItem = await budgetService.createBudgetItem(
        currentBudgetId, 
        name, 
        amount, 
        isImpulse
      );
      
      setBudgetItems([
        ...budgetItems,
        {
          id: newItem.id,
          name: newItem.name,
          amount: newItem.amount,
          spent: 0,
          subItems: [],
          isImpulse: newItem.is_impulse
        }
      ]);
    } catch (error: any) {
      toast({
        title: "Error adding budget item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      const dbUpdates: any = { ...updates };
      
      if (updates.isImpulse !== undefined) {
        dbUpdates.is_impulse = updates.isImpulse;
        delete dbUpdates.isImpulse;
      }
      
      await budgetService.updateBudgetItem(id, dbUpdates);
      
      setBudgetItems(
        budgetItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating budget item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteBudgetItem = async (id: string) => {
    try {
      await budgetService.deleteBudgetItem(id);
      setBudgetItems(budgetItems.filter(item => item.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting budget item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addSubItem = async (budgetItemId: string, name: string, amount: number) => {
    try {
      const newSubItem = await budgetService.createSubItem(budgetItemId, name, amount);
      
      setBudgetItems(budgetItems.map(item => {
        if (item.id === budgetItemId) {
          return {
            ...item,
            subItems: [...item.subItems, {
              id: newSubItem.id,
              name: newSubItem.name,
              amount: newSubItem.amount,
              note: newSubItem.note,
              tag: newSubItem.tag,
              hasExpenses: false
            }]
          };
        }
        return item;
      }));
    } catch (error: any) {
      toast({
        title: "Error adding sub-item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSubItem = async (budgetItemId: string, subItemId: string) => {
    try {
      await budgetService.deleteSubItem(subItemId);
      
      setBudgetItems(budgetItems.map(item => {
        if (item.id === budgetItemId) {
          return {
            ...item,
            subItems: item.subItems.filter(subItem => subItem.id !== subItemId)
          };
        }
        return item;
      }));
    } catch (error: any) {
      toast({
        title: "Error deleting sub-item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSubItem = async (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => {
    try {
      await budgetService.updateSubItem(subItemId, updates);
      
      setBudgetItems(
        budgetItems.map(item =>
          item.id === budgetItemId
            ? { 
                ...item, 
                subItems: item.subItems.map(sub =>
                  sub.id === subItemId ? { ...sub, ...updates } : sub
                )
              }
            : item
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating sub-item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateItemDeadline = async (itemId: string, deadline: Date) => {
    try {
      await budgetService.updateBudgetItem(itemId, { deadline: deadline.toISOString() });      
      setBudgetItems(
        budgetItems.map(item =>
          item.id === itemId ? { ...item, deadline } : item
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating deadline",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      console.log(`Adding expense: itemId=${itemId}, amount=${amount}, subItemIds=${subItemIds?.join(',')}`);
      
      if (subItemIds && subItemIds.length > 0) {
        await budgetService.addExpense(itemId, amount, subItemIds);
      } else {
        await budgetService.addExpense(itemId, amount);
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
    }
  };

  return {
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    addSubItem,
    deleteSubItem,
    updateSubItem,
    updateItemDeadline,
    addExpense
  };
};
