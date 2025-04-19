
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type BudgetPeriod = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'custom';

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

interface BudgetContextType {
  period: BudgetPeriod | null;
  totalBudget: number;
  budgetItems: BudgetItem[];
  setPeriod: (period: BudgetPeriod) => void;
  setTotalBudget: (amount: number) => void;
  addBudgetItem: (name: string, amount: number) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  addExpense: (itemId: string, amount: number) => void;
  resetBudget: () => void;
  getRemainingBudget: () => number;
  getTotalSpent: () => number;
  getTotalAllocated: () => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [period, setPeriod] = useState<BudgetPeriod | null>(null);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  const addBudgetItem = (name: string, amount: number) => {
    setBudgetItems([
      ...budgetItems,
      {
        id: Date.now().toString(),
        name,
        amount,
        spent: 0
      }
    ]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(
      budgetItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const addExpense = (itemId: string, amount: number) => {
    setBudgetItems(
      budgetItems.map(item => 
        item.id === itemId 
          ? { ...item, spent: item.spent + amount } 
          : item
      )
    );
  };

  const resetBudget = () => {
    setPeriod(null);
    setTotalBudget(0);
    setBudgetItems([]);
  };

  const getTotalAllocated = () => {
    return budgetItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalSpent = () => {
    return budgetItems.reduce((sum, item) => sum + item.spent, 0);
  };

  const getRemainingBudget = () => {
    return totalBudget - getTotalSpent();
  };

  return (
    <BudgetContext.Provider
      value={{
        period,
        totalBudget,
        budgetItems,
        setPeriod,
        setTotalBudget,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addExpense,
        resetBudget,
        getRemainingBudget,
        getTotalSpent,
        getTotalAllocated
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
