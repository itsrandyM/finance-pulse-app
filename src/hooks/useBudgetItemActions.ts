
import { useState } from 'react';
import { BudgetItem, SubBudgetItem } from '@/types/budget';
import * as budgetService from '@/services/budgetService';
import { BudgetItemUpdate } from '@/services/budgetItemService';

interface UseBudgetItemActionsProps {
  currentBudgetId: string | null;
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  toast: any;
  loadBudget: () => Promise<void>; // Changed from Promise<boolean> to Promise<void>
}

export const useBudgetItemActions = ({
  currentBudgetId,
  budgetItems,
  setBudgetItems,
  toast,
  loadBudget
}: UseBudgetItemActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const addBudgetItem = async (name: string, amount: number, isImpulse: boolean = false) => {
    if (!name || name.trim().length === 0) {
      toast({ title: "Invalid Name", description: "Budget item name cannot be empty.", variant: "destructive" });
      return;
    }
    if (amount <= 0) {
      toast({ title: "Invalid Amount", description: "Amount must be a positive number.", variant: "destructive" });
      return;
    }
    
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
        isImpulse,
        false, // isContinuous
        false  // isRecurring
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
          isContinuous: newItem.is_continuous || false,
          isRecurring: newItem.is_recurring || false
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

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      setIsLoading(true);
      
      // Ensure mutual exclusivity
      if (updates.isContinuous === true) {
        updates.isRecurring = false;
      } else if (updates.isRecurring === true) {
        updates.isContinuous = false;
      }

      // Convert BudgetItem updates to BudgetItemUpdate format
      const itemUpdate: BudgetItemUpdate = {
        name: updates.name,
        amount: updates.amount,
        isImpulse: updates.isImpulse,
        isContinuous: updates.isContinuous,
        isRecurring: updates.isRecurring,
        deadline: updates.deadline ? updates.deadline.toISOString() : null,
        note: updates.note,
        tag: updates.tag as string | null
      };
      
      await budgetService.updateBudgetItem(id, itemUpdate);
      
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
    if (!name || name.trim().length === 0) {
      toast({ title: "Invalid Name", description: "Sub-item name cannot be empty.", variant: "destructive" });
      return;
    }
    if (amount <= 0) {
      toast({ title: "Invalid Amount", description: "Amount must be a positive number.", variant: "destructive" });
      return;
    }

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
      // Create a proper BudgetItemUpdate object with just the deadline field
      const update: BudgetItemUpdate = { 
        deadline: deadline ? deadline.toISOString() : null 
      };
      await budgetService.updateBudgetItem(itemId, update);
      
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
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new function to mark items as continuous
  const markItemAsContinuous = async (itemId: string, isContinuous: boolean) => {
    try {
      setIsLoading(true);
      // Create a proper BudgetItemUpdate object with just the isContinuous field
      const update: BudgetItemUpdate = { isContinuous };
      await budgetService.updateBudgetItem(itemId, update);
      
      setBudgetItems(
        budgetItems.map(item =>
          item.id === itemId ? { ...item, isContinuous } : item
        )
      );
      
      toast({
        title: isContinuous ? "Item will continue to next period" : "Item will not continue to next period",
      });
    } catch (error: any) {
      toast({
        title: "Error updating item continuity",
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
    markItemAsContinuous,
    isLoading
  };
};
