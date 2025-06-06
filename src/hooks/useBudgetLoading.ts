
import { useState, useRef } from 'react';
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
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef<number>(0);
  const MIN_LOAD_INTERVAL = 1000; // Increase to 1 second to prevent rapid loading
  
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
    if (!budgetDateRange?.startDate) {
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
    if (!user) {
      console.log("No user found, cannot load budget");
      return false;
    }
    
    // Prevent concurrent loading
    if (isLoadingRef.current) {
      console.log("Already loading budget, skipping duplicate call");
      return false;
    }
    
    const now = Date.now();
    if (now - lastLoadTimeRef.current < MIN_LOAD_INTERVAL) {
      console.log("Budget was loaded recently, skipping duplicate call");
      return false;
    }
    
    try {
      console.log("=== LOADING BUDGET ===");
      isLoadingRef.current = true;
      setIsLoading(true);
      lastLoadTimeRef.current = Date.now();
      
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
      console.log("Raw budget items from database:", items);
      
      const processedItems: BudgetItem[] = items.map((item: any) => {
        // Convert spent to number explicitly and add detailed logging
        const spentAmount = parseFloat(item.spent?.toString() || '0') || 0;
        console.log(`Processing item "${item.name}": raw spent="${item.spent}", parsed spent=${spentAmount}, amount=${item.amount}`);
        
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
          spent: spentAmount,
          subItems: subItems,
          deadline: item.deadline ? new Date(item.deadline) : undefined,
          isImpulse: item.is_impulse || false,
          isContinuous: item.is_continuous || false,
          isRecurring: item.is_recurring || false,
          note: item.note || undefined,
          tag: item.tag || null,
        };
      });
      
      console.log("Processed budget items with spent amounts:", processedItems.map(item => ({
        name: item.name,
        spent: item.spent,
        amount: item.amount
      })));
      
      setBudgetItems(processedItems);
      
      const startDate = new Date(budget.created_at || new Date());
      const dateRange = calculateDateRange(startDate, budget.period as BudgetPeriod);
      setBudgetDateRange(dateRange);
      
      const nowDate = new Date();
      const isExpired = nowDate > dateRange.endDate;
      setIsBudgetExpired(isExpired);
      
      console.log("=== BUDGET LOADED SUCCESSFULLY ===");
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
      isLoadingRef.current = false;
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
