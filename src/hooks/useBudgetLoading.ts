
import { useState } from 'react';
import { BudgetPeriod, BudgetDateRange, BudgetItem } from '@/types/budget';
import * as budgetService from '@/services/budgetService';
import { useBudgetDateRange } from './useBudgetDateRange';
import { useBudgetInitialization } from './useBudgetInitialization';
import { useLoading } from '@/contexts/LoadingContext';

interface UseBudgetLoadingProps {
  user: any;
  budgetDateRange: BudgetDateRange | null;
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
  const { calculateDateRange } = useBudgetDateRange();
  const { setIsLoading } = useLoading();
  const { initializeBudget: initBudget } = useBudgetInitialization({
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
  });

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
        setIsLoading(false);
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
          isContinuous: item.is_continuous || false,
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

  const initializeBudget = async (budgetPeriod: BudgetPeriod, amount: number): Promise<void> => {
    return await initBudget(budgetPeriod, amount);
  };

  return {
    initializeBudget,
    createNewBudgetPeriod,
    loadBudget
  };
};
