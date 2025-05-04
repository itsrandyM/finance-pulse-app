
import { useState } from 'react';
import { BudgetPeriod, BudgetItem } from '@/types/budget';
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
      
      // If there's a previous remaining budget, add it to the new budget amount
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
        setPreviousRemainingBudget(0);
      }
      
      // Create date range for the new budget
      const startDate = new Date(budget.created_at || new Date());
      const dateRange = calculateDateRange(startDate, budgetPeriod);
      setBudgetDateRange(dateRange);
      setIsBudgetExpired(false);
      
      // If there are any continuous budget items from the previous budget, add them to the new budget
      const newBudgetItems: BudgetItem[] = [];
      
      if (continuousBudgetItems.length > 0) {
        for (const item of continuousBudgetItems) {
          // Create a new budget item with the same details
          try {
            const newItem = await budgetService.createBudgetItem(
              budget.id,
              item.name,
              item.amount,
              item.isImpulse || false,
              item.isContinuous || false
            );
            
            // Add to the local state with the spent amount from the previous budget
            newBudgetItems.push({
              id: newItem.id,
              name: newItem.name,
              amount: newItem.amount,
              spent: item.spent, // Preserve the spent amount from the previous budget item
              subItems: [], // Sub-items will need to be added separately if needed
              isImpulse: newItem.is_impulse,
              isContinuous: newItem.is_continuous !== undefined ? newItem.is_continuous : false
            });
            
            // Copy sub-items if any
            if (item.subItems.length > 0) {
              for (const subItem of item.subItems) {
                await budgetService.createSubItem(
                  newItem.id,
                  subItem.name,
                  subItem.amount
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
        
        // Reset continuous budget items after adding them
        setContinuousBudgetItems([]);
      }
      
      // Set the initial budget items
      setBudgetItems(newBudgetItems);
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
