
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import * as budgetService from '@/services/budgetService';
import { BudgetItem, SubBudgetItem } from '@/types/budget';

export const useSubItemActions = (
  budgetItems: BudgetItem[],
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>
) => {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const addSubItem = async (budgetItemId: string, name: string, amount: number) => {
    try {
      startLoading("Adding sub-item...");
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

      toast({
        title: "Sub-item added",
        description: `${name} has been added successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error adding sub-item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  const deleteSubItem = async (budgetItemId: string, subItemId: string) => {
    try {
      startLoading("Deleting sub-item...");
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

      toast({
        title: "Sub-item deleted",
        description: "The sub-item has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting sub-item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  const updateSubItem = async (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => {
    try {
      startLoading("Updating sub-item...");
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

      toast({
        title: "Sub-item updated",
        description: "The sub-item has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error updating sub-item",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  return {
    addSubItem,
    deleteSubItem,
    updateSubItem
  };
};
