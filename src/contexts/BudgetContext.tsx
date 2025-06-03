
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
  const [period, setPeriodState] = useState<BudgetPeriod | null>(null);
  const [totalBudget, setTotalBudgetState] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [budgetDateRange, setBudgetDateRange] = useState<BudgetDateRange | null>(null);
  const [isBudgetExpired, setIsBudgetExpired] = useState<boolean>(false);
  const [previousRemainingBudget, setPreviousRemainingBudget] = useState<number>(0);
  const [continuousBudgetItems, setContinuousBudgetItems] = useState<BudgetItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isLoading, setIsLoading } = useLoading();

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
    currentBudgetId
  });

  const budgetCalculations = useBudgetCalculations({
    budgetItems,
    totalBudget
  });

  // Check if budget is expired when date range changes
  useEffect(() => {
    if (budgetDateRange && budgetDateRange.endDate) {
      const now = new Date();
      const isExpired = now > budgetDateRange.endDate;
      
      if (isExpired && !isBudgetExpired) {
        console.log("Budget has expired - the ExpiredBudgetOverlay will handle storing the remaining budget");
        
        // Store budget items that should be continued
        const itemsToContinue = budgetItems.filter(item => item.isContinuous);
        console.log(`Continuing ${itemsToContinue.length} items to next budget period`);
        setContinuousBudgetItems(itemsToContinue);
      }
      
      setIsBudgetExpired(isExpired);
    }
  }, [budgetDateRange, budgetItems, isBudgetExpired]);

  // Load budget when user changes
  useEffect(() => {
    if (user) {
      budgetLoading.loadBudget().catch(error => {
        console.error("Failed to load budget:", error);
      });
    }
  }, [user]);

  const setPeriod = (newPeriod: BudgetPeriod) => {
    setPeriodState(newPeriod);
  };

  const setTotalBudget = (amount: number) => {
    // Add the previous remaining budget if it exists
    const finalAmount = previousRemainingBudget > 0 
      ? amount + previousRemainingBudget 
      : amount;
    
    console.log(`Setting total budget: ${amount} + previous remaining ${previousRemainingBudget} = ${finalAmount}`);
    setTotalBudgetState(finalAmount);
  };

  const resetBudget = () => {
    setPeriodState(null);
    setTotalBudgetState(0);
    setBudgetItems([]);
    setCurrentBudgetId(null);
    setBudgetDateRange(null);
    setIsBudgetExpired(false);
    setPreviousRemainingBudget(0);
    setContinuousBudgetItems([]);
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

  return (
    <BudgetContext.Provider
      value={{
        period,
        totalBudget,
        budgetItems,
        setPeriod,
        setTotalBudget,
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
        isLoading,
        currentBudgetId,
        initializeBudget: budgetLoading.initializeBudget,
        loadBudget: budgetLoading.loadBudget,
        budgetDateRange,
        isBudgetExpired,
        createNewBudgetPeriod: budgetLoading.createNewBudgetPeriod,
        previousRemainingBudget,
        continuousBudgetItems,
        markItemAsContinuous,
        setPreviousRemainingBudget
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
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
