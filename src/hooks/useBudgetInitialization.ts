
import { useState } from 'react';
import { BudgetPeriod, BudgetItem, BudgetDateRange } from '@/types/budget';
import * as budgetService from '@/services/budgetService';
import { useLoading } from '@/contexts/LoadingContext';
import { useBudgetDateRange } from './useBudgetDateRange';

interface UseBudgetInitializationProps {
  setCurrentBudgetId: React.Dispatch<React.SetStateAction<string | null>>;
  setPeriodState: React.Dispatch<React.SetStateAction<BudgetPeriod | null>>;
  setTotalBudgetState: React.Dispatch<React.SetStateAction<number>>;
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  setBudgetDateRange: React.Dispatch<React.SetStateAction<BudgetDateRange | null>>;
  setIsBudgetExpired: React.Dispatch<React.SetStateAction<boolean>>;
  previousRemainingBudget: number;
  setPreviousRemainingBudget: React.Dispatch<React.SetStateAction<number>>;
  continuousBudgetItems: BudgetItem[];
  setContinuousBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  toast: any;
}

export const useBudgetInitialization = ({
  setCurrentBudgetId,
  setPeriodState,
  setTotalBudgetState,
  setBudgetItems,
  setBudgetDateRange,
  setIsBudgetExpired,
  previousRemainingBudget,
  setPreviousRemainingBudget,
  continuousBudgetItems,
  setContinuousBudgetItems,
  toast
}: UseBudgetInitializationProps) => {
  const { setIsLoading } = useLoading();
  const { calculateDateRange } = useBudgetDateRange();

  const initializeBudget = async (budgetPeriod: BudgetPeriod, amount: number): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Calculate the final amount (only add remaining budget once)
      const finalAmount = previousRemainingBudget > 0 
        ? amount + previousRemainingBudget 
        : amount;
      
      console.log(`Initializing budget with amount ${amount} + remaining ${previousRemainingBudget} = ${finalAmount}`);
      
      // Create the new budget
      const budget = await budgetService.createBudget(budgetPeriod, finalAmount);
      setCurrentBudgetId(budget.id);
      setPeriodState(budgetPeriod);
      setTotalBudgetState(finalAmount);
      
      // Reset the previous remaining budget after using it
      if (previousRemainingBudget > 0) {
        console.log("Resetting previous remaining budget from", previousRemainingBudget, "to 0");
        setPreviousRemainingBudget(0);
      }
      
      // Create date range for the new budget
      const startDate = new Date(budget.created_at || new Date());
      const dateRange = calculateDateRange(startDate, budgetPeriod);
      setBudgetDateRange(dateRange);
      setIsBudgetExpired(false);
      
      // Process continuous and recurring items from the previous budget
      const newBudgetItems: BudgetItem[] = [];
      
      if (continuousBudgetItems.length > 0) {
        for (const item of continuousBudgetItems) {
          try {
            // Handle continuous items - carry over with reduced amount
            if (item.isContinuous) {
              const remainingAmount = Math.max(0, item.amount - item.spent);
              const newItem = await budgetService.createBudgetItem(
                budget.id,
                item.name,
                remainingAmount,
                item.isImpulse || false,
                true, // Keep as continuous
                item.isRecurring || false
              );
              
              newBudgetItems.push({
                id: newItem.id,
                name: newItem.name,
                amount: remainingAmount,
                spent: item.spent, // Continue tracking from where we left off
                subItems: [],
                isImpulse: newItem.is_impulse || false,
                isContinuous: true,
                isRecurring: newItem.is_recurring || false,
                note: item.note,
                tag: item.tag
              });
            }
            
            // Handle recurring items - create fresh with original amount
            if (item.isRecurring) {
              const newItem = await budgetService.createBudgetItem(
                budget.id,
                item.name,
                item.amount,
                item.isImpulse || false,
                item.isContinuous || false, // Preserve continuous status for items that are both
                true // Keep as recurring
              );
              
              newBudgetItems.push({
                id: newItem.id,
                name: newItem.name,
                amount: item.amount,
                spent: 0, // Fresh start for recurring items
                subItems: [],
                isImpulse: newItem.is_impulse || false,
                isContinuous: newItem.is_continuous || false,
                isRecurring: true,
                note: item.note,
                tag: item.tag
              });
            }
            
            // Recreate sub-items for all carried over items
            if (item.subItems.length > 0) {
              for (const subItem of item.subItems) {
                await budgetService.createSubItem(
                  newBudgetItems[newBudgetItems.length - 1].id,
                  subItem.name,
                  subItem.amount,
                  subItem.note,
                  subItem.tag
                );
              }
            }
          } catch (error: any) {
            console.error("Failed to recreate budget item:", error);
            toast({
              title: `Failed to recreate ${item.name}`,
              description: error.message,
              variant: "destructive"
            });
          }
        }
        
        // Reset continuous budget items after processing them
        setContinuousBudgetItems([]);
      }
      
      // Set the initial budget items
      setBudgetItems(newBudgetItems);
      
      console.log("Budget initialization complete with", newBudgetItems.length, "items");
    } catch (error: any) {
      toast({
        title: "Error creating budget",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { initializeBudget };
};
