
import { useState } from 'react';
import { BudgetPeriod, BudgetDateRange, BudgetItem } from '@/types/budget';
import * as budgetService from '@/services/budgetService';

interface UseBudgetLoadingProps {
  user: any;
  budgetDateRange: BudgetDateRange | null;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPeriodState: React.Dispatch<React.SetStateAction<BudgetPeriod | null>>;
  setTotalBudgetState: React.Dispatch<React.SetStateAction<number>>;
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  setCurrentBudgetId: React.Dispatch<React.SetStateAction<string | null>>;
  setBudgetDateRange: React.Dispatch<React.SetStateAction<BudgetDateRange | null>>;
  setIsBudgetExpired: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
  previousRemainingBudget: number;
  setPreviousRemainingBudget: React.Dispatch<React.SetStateAction<number>>;
  continuousBudgetItems: BudgetItem[];
  setContinuousBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
}

export const useBudgetLoading = ({
  user,
  budgetDateRange,
  setIsLoading,
  setPeriodState,
  setTotalBudgetState,
  setBudgetItems,
  setCurrentBudgetId,
  setBudgetDateRange,
  setIsBudgetExpired,
  toast,
  previousRemainingBudget,
  setPreviousRemainingBudget,
  continuousBudgetItems,
  setContinuousBudgetItems
}: UseBudgetLoadingProps) => {
  
  const calculateDateRange = (startDate: Date, budgetPeriod: BudgetPeriod): BudgetDateRange => {
    const endDate = new Date(startDate);
    
    switch (budgetPeriod) {
      case 'daily':
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'bi-weekly':
        endDate.setDate(startDate.getDate() + 14);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'semi-annually':
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      case 'annually':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
      default:
        endDate.setDate(startDate.getDate() + 30);
    }
    
    return { startDate, endDate };
  };

  const initializeBudget = async (budgetPeriod: BudgetPeriod, amount: number): Promise<void> => {
    try {
      setIsLoading(true);
      
      // If there's a previous remaining budget, add it to the new budget amount
      const finalAmount = previousRemainingBudget > 0 
        ? amount + previousRemainingBudget 
        : amount;
      
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

  const createNewBudgetPeriod = async (): Promise<void> => {
    const currentPeriod = budgetDateRange?.startDate ? 
      new Date(budgetDateRange.startDate) : 
      new Date();
    
    if (!currentPeriod) {
      toast({
        title: "Missing budget information",
        description: "Cannot create a new budget period without period information.",
        variant: "destructive"
      });
      return;
    }
    
    // Load the current budget to get period and check for continuous items
    await loadBudget();
  };

  const loadBudget = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Loading budget...");
      setIsLoading(true);
      const budget = await budgetService.getCurrentBudget();
      
      if (!budget) {
        console.log("No budget found");
        return false;
      }
      
      console.log("Budget found:", budget);
      setCurrentBudgetId(budget.id);
      setPeriodState(budget.period as BudgetPeriod);
      setTotalBudgetState(budget.total_budget);
      
      console.log("Fetching budget items for budget:", budget.id);
      const items = await budgetService.getBudgetItems(budget.id);
      console.log("Budget items fetched:", items);
      
      const processedItems: BudgetItem[] = items.map((item: any) => {
        const subItems = item.sub_items.map((subItem: any) => ({
          id: subItem.id,
          name: subItem.name,
          amount: subItem.amount,
          note: subItem.note || undefined,
          tag: subItem.tag || null,
        }));
        
        return {
          id: item.id,
          name: item.name,
          amount: item.amount,
          spent: item.spent,
          subItems: subItems,
          deadline: item.deadline ? new Date(item.deadline) : undefined,
          isImpulse: item.is_impulse || false,
          isContinuous: item.is_continuous !== undefined ? item.is_continuous : false,
          note: item.note || undefined,
          tag: item.tag || null,
        };
      });
      
      console.log("Setting budget items:", processedItems);
      setBudgetItems(processedItems);
      
      const startDate = new Date(budget.created_at || new Date());
      const dateRange = calculateDateRange(startDate, budget.period as BudgetPeriod);
      setBudgetDateRange(dateRange);
      
      const now = new Date();
      const isExpired = now > dateRange.endDate;
      setIsBudgetExpired(isExpired);
      
      console.log("Budget fully loaded");
      return true;
    } catch (error: any) {
      console.error("Error loading budget:", error);
      toast({
        title: "Error loading budget",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initializeBudget,
    createNewBudgetPeriod,
    loadBudget
  };
};
