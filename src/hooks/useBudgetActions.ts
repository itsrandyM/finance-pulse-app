
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import * as budgetService from '@/services/budgetService';
import { BudgetItem } from '@/types/budget';

export const useBudgetActions = (
  budgetItems: BudgetItem[], 
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>,
  loadBudget: () => Promise<boolean>,
  currentBudgetId: string | null
) => {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const addBudgetItem = async (name: string, amount: number, isImpulse: boolean = false, isContinuous: boolean = false) => {
    if (!currentBudgetId) {
      toast({
        title: "Error adding budget item",
        description: "No current budget found",
        variant: "destructive"
      });
      return;
    }

    try {
      startLoading("Adding budget item...");
      const newItem = await budgetService.createBudgetItem(
        currentBudgetId, 
        name, 
        amount, 
        isImpulse,
        isContinuous
      );
      
      setBudgetItems([
        ...budgetItems,
        {
          id: newItem.id,
          name: newItem.name,
          amount: newItem.amount,
          spent: 0,
          subItems: [],
          isImpulse: newItem.is_impulse,
          isContinuous: newItem.is_continuous || false
        }
      ]);

      toast({
        title: "Budget item added",
        description: `${name} has been added to your budget.`
      });
    } catch (error: any) {
      toast({
        title: "Error adding budget item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      startLoading("Updating budget item...");
      await budgetService.updateBudgetItem(id, updates);
      
      setBudgetItems(
        budgetItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );

      toast({
        title: "Budget item updated",
        description: "Your budget item has been updated."
      });
    } catch (error: any) {
      toast({
        title: "Error updating budget item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  const deleteBudgetItem = async (id: string) => {
    try {
      startLoading("Deleting budget item...");
      await budgetService.deleteBudgetItem(id);
      setBudgetItems(budgetItems.filter(item => item.id !== id));
      
      toast({
        title: "Budget item deleted",
        description: "The budget item has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting budget item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  const markItemAsContinuous = async (itemId: string, isContinuous: boolean) => {
    try {
      startLoading("Updating item status...");
      await budgetService.updateBudgetItem(itemId, { isContinuous });
      
      setBudgetItems(
        budgetItems.map(item =>
          item.id === itemId ? { ...item, isContinuous } : item
        )
      );
      
      toast({
        title: isContinuous 
          ? "Item marked as continuous" 
          : "Item removed from continuous tracking",
      });
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  return {
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    markItemAsContinuous
  };
};
