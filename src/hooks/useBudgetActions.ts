
import { useState } from 'react';
import { BudgetItem, SubBudgetItem } from '@/types/budget';
import * as budgetService from '@/services/budgetService';
import { useLoading } from '@/contexts/LoadingContext';

interface UseBudgetActionsProps {
  currentBudgetId: string | null;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  toast: any;
  loadBudget: () => Promise<boolean>;
}

export const useBudgetActions = ({
  currentBudgetId,
  budgetItems,
  setBudgetItems,
  toast,
  loadBudget
}: UseBudgetActionsProps) => {
  const { setIsLoading } = useLoading();
  
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
      setIsLoading(true);
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
          isImpulse: newItem.is_impulse || false,
          isContinuous: newItem.is_continuous || false
        }
      ]);
    } catch (error: any) {
      toast({
        title: "Error adding budget item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetItem = async (id: string, updates: Partial<Omit<BudgetItem, 'deadline'>> & { deadline?: Date | null }) => {
    try {
      setIsLoading(true);
      await budgetService.updateBudgetItem(id, updates);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBudgetItem = async (id: string) => {
    try {
      setIsLoading(true);
      await budgetService.deleteBudgetItem(id);
      setBudgetItems(budgetItems.filter(item => item.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting budget item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSubItem = async (budgetItemId: string, name: string, amount: number) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubItem = async (budgetItemId: string, subItemId: string) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubItem = async (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemDeadline = async (itemId: string, deadline: Date | null) => {
    try {
      setIsLoading(true);
      await budgetService.updateBudgetItem(itemId, { deadline });
      
      setBudgetItems(
        budgetItems.map(item =>
          item.id === itemId ? { ...item, deadline: deadline || undefined } : item
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating deadline",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
  };
};
