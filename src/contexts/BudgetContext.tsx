
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
import { useBudgetOperations } from '@/hooks/useBudgetOperations';
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations';
import { useBudgetLoading } from '@/hooks/useBudgetLoading';

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [period, setPeriodState] = useState<BudgetPeriod | null>(null);
  const [totalBudget, setTotalBudgetState] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [budgetDateRange, setBudgetDateRange] = useState<BudgetDateRange | null>(null);
  const [isBudgetExpired, setIsBudgetExpired] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Custom hooks for budget functionality
  const budgetLoading = useBudgetLoading({
    user,
    budgetDateRange,
    setIsLoading,
    setPeriodState,
    setTotalBudgetState,
    setBudgetItems,
    setCurrentBudgetId,
    setBudgetDateRange,
    setIsBudgetExpired,
    toast
  });

  const budgetOperations = useBudgetOperations({
    currentBudgetId,
    budgetItems,
    setBudgetItems,
    toast,
    loadBudget: budgetLoading.loadBudget
  });

  const budgetCalculations = useBudgetCalculations({
    budgetItems,
    totalBudget
  });

  // Check if budget is expired when date range changes
  useEffect(() => {
    if (budgetDateRange && budgetDateRange.endDate) {
      const now = new Date();
      setIsBudgetExpired(now > budgetDateRange.endDate);
    }
  }, [budgetDateRange]);

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
    setTotalBudgetState(amount);
  };

  const resetBudget = () => {
    setPeriodState(null);
    setTotalBudgetState(0);
    setBudgetItems([]);
    setCurrentBudgetId(null);
    setBudgetDateRange(null);
    setIsBudgetExpired(false);
  };

  return (
    <BudgetContext.Provider
      value={{
        period,
        totalBudget,
        budgetItems,
        setPeriod,
        setTotalBudget,
        addBudgetItem: budgetOperations.addBudgetItem,
        updateBudgetItem: budgetOperations.updateBudgetItem,
        deleteBudgetItem: budgetOperations.deleteBudgetItem,
        addSubItem: budgetOperations.addSubItem,
        deleteSubItem: budgetOperations.deleteSubItem,
        updateSubItem: budgetOperations.updateSubItem,
        addExpense: budgetOperations.addExpense,
        resetBudget,
        getRemainingBudget: budgetCalculations.getRemainingBudget,
        getTotalSpent: budgetCalculations.getTotalSpent,
        getTotalAllocated: budgetCalculations.getTotalAllocated,
        updateItemDeadline: budgetOperations.updateItemDeadline,
        isLoading,
        currentBudgetId,
        initializeBudget: budgetLoading.initializeBudget,
        loadBudget: budgetLoading.loadBudget,
        budgetDateRange,
        isBudgetExpired,
        createNewBudgetPeriod: budgetLoading.createNewBudgetPeriod
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
