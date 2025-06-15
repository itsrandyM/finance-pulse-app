
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { 
  BudgetPeriod,
  BudgetItem,
  SubBudgetItem,
  BudgetDateRange,
  BudgetContextType,
  TagOption
} from '@/types/budget';
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations';
import { useBudgetLoading } from '@/hooks/useBudgetLoading';
import { useBudgetItemActions } from '@/hooks/useBudgetItemActions';
import { useExpenseActions } from '@/hooks/useExpenseActions';
import { useLoading } from './LoadingContext';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [periodState, setPeriodState] = useState<BudgetPeriod | null>(null);
  const [totalBudgetState, setTotalBudgetState] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [budgetDateRange, setBudgetDateRange] = useState<BudgetDateRange | null>(null);
  const [isBudgetExpired, setIsBudgetExpired] = useState<boolean>(false);
  const [previousRemainingBudget, setPreviousRemainingBudget] = useState<number>(0);
  const [continuousBudgetItems, setContinuousBudgetItems] = useState<BudgetItem[]>([]);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading, setIsLoading } = useLoading();

  // Reset all budget state when user changes
  const resetBudgetState = () => {
    console.log('Resetting budget state for user change');
    setPeriodState(null);
    setTotalBudgetState(0);
    setBudgetItems([]);
    setCurrentBudgetId(null);
    setBudgetDateRange(null);
    setIsBudgetExpired(false);
    setPreviousRemainingBudget(0);
    setContinuousBudgetItems([]);
  };

  // Custom hooks for budget functionality
  const budgetLoading = useBudgetLoading({
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
  });

  const budgetItemActions = useBudgetItemActions({
    currentBudgetId,
    budgetItems,
    setBudgetItems,
    toast,
    loadBudget: budgetLoading.loadBudget
  });

  const expenseActions = useExpenseActions({
    toast,
    loadBudget: budgetLoading.loadBudget,
    setBudgetItems,
    currentBudgetId,
    budgetItems
  });

  const budgetCalculations = useBudgetCalculations({
    budgetItems,
    totalBudget: totalBudgetState
  });

  // Reset budget data when user changes or signs out
  useEffect(() => {
    if (!user) {
      console.log('No user found, resetting budget state');
      resetBudgetState();
      return;
    }

    // When user changes, reset state and load their budget
    console.log('User changed, loading budget for:', user.email);
    resetBudgetState();
    
    // Small delay to ensure state is cleared before loading new data
    const timeoutId = setTimeout(() => {
      budgetLoading.loadBudget().catch(error => {
        console.error("Failed to load budget for user:", user.email, error);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id]); // Only trigger when user ID changes

  // Check if budget is expired when date range changes
  useEffect(() => {
    if (budgetDateRange && budgetDateRange.endDate) {
      const now = new Date();
      const isExpired = now > budgetDateRange.endDate;
      
      if (isExpired && !isBudgetExpired) {
        console.log("Budget has expired - the ExpiredBudgetOverlay will handle storing the remaining budget");
        
        // Store budget items that should be continued (both continuous and recurring)
        const itemsToContinue = budgetItems.filter(item => item.isContinuous || item.isRecurring);
        console.log(`Continuing ${itemsToContinue.length} items to next budget period`);
        setContinuousBudgetItems(itemsToContinue);
      }
      
      setIsBudgetExpired(isExpired);
    }
  }, [budgetDateRange, budgetItems, isBudgetExpired]);

  const setPeriod = (newPeriod: BudgetPeriod) => {
    setPeriodState(newPeriod);
  };

  const setTotalBudget = (amount: number) => {
    // The amount from BudgetAmountInputPage already includes the previous remaining budget.
    // We set the amount directly here to avoid double-counting.
    console.log(`Setting total budget directly to: ${amount}`);
    setTotalBudgetState(amount);
  };

  const resetBudget = () => {
    resetBudgetState();
  };

  const markItemAsContinuous = async (itemId: string, isContinuous: boolean) => {
    try {
      setIsLoading(true);
      await budgetItemActions.updateBudgetItem(itemId, { isContinuous });
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
      setIsLoading(false);
    }
  };

  const createNewBudgetPeriod = async (period: BudgetPeriod, amount: number): Promise<void> => {
    return await budgetLoading.createNewBudgetPeriod(period, amount);
  };

  const loadBudget = async (): Promise<void> => {
    await budgetLoading.loadBudget();
  };

  const value = {
    period: periodState,
    totalBudget: totalBudgetState,
    budgetItems,
    setPeriod: setPeriodState,
    setTotalBudget: setTotalBudgetState,
    setBudgetItems,
    addBudgetItem: budgetItemActions.addBudgetItem,
    updateBudgetItem: budgetItemActions.updateBudgetItem,
    deleteBudgetItem: budgetItemActions.deleteBudgetItem,
    addSubItem: budgetItemActions.addSubItem,
    deleteSubItem: budgetItemActions.deleteSubItem,
    updateSubItem: budgetItemActions.updateSubItem,
    addExpense: expenseActions.addExpense,
    resetBudget,
    getRemainingBudget: budgetCalculations.getRemainingBudget,
    getTotalSpent: budgetCalculations.getTotalSpent,
    getTotalAllocated: budgetCalculations.getTotalAllocated,
    updateItemDeadline: budgetItemActions.updateItemDeadline,
    isLoading: isLoading || expenseActions.isAddingExpense || authLoading,
    currentBudgetId,
    initializeBudget: budgetLoading.initializeBudget,
    loadBudget,
    budgetDateRange,
    isBudgetExpired,
    createNewBudgetPeriod,
    previousRemainingBudget,
    continuousBudgetItems,
    markItemAsContinuous,
    setPreviousRemainingBudget,
    setContinuousBudgetItems
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

// Re-export types for convenience
export type { 
  BudgetPeriod,
  BudgetItem,
  SubBudgetItem,
  BudgetDateRange,
  TagOption
};
