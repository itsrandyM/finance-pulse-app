
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type BudgetPeriod = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'custom';

export type TagOption = string | null;

export interface SubBudgetItem {
  id: string;
  name: string;
  amount: number;
  note?: string;
  tag?: TagOption;
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  spent: number;
  subItems: SubBudgetItem[];
  deadline?: Date;
  isImpulse?: boolean;
  note?: string;
  tag?: TagOption;
}

interface BudgetContextType {
  period: BudgetPeriod | null;
  totalBudget: number;
  budgetItems: BudgetItem[];
  setPeriod: (period: BudgetPeriod) => void;
  setTotalBudget: (amount: number) => void;
  addBudgetItem: (name: string, amount: number, isImpulse: boolean) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  addSubItem: (budgetItemId: string, name: string, amount: number) => void;
  deleteSubItem: (budgetItemId: string, subItemId: string) => void;
  updateSubItem: (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => void;
  addExpense: (itemId: string, amount: number) => void;
  resetBudget: () => void;
  getRemainingBudget: () => number;
  getTotalSpent: () => number;
  getTotalAllocated: () => number;
  updateItemDeadline: (itemId: string, deadline: Date) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [period, setPeriod] = useState<BudgetPeriod | null>(null);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  const updateItemDeadline = (itemId: string, deadline: Date) => {
    setBudgetItems(
      budgetItems.map(item =>
        item.id === itemId ? { ...item, deadline } : item
      )
    );
  };

  const addBudgetItem = (name: string, amount: number, isImpulse: boolean = false) => {
    setBudgetItems([
      ...budgetItems,
      {
        id: Date.now().toString(),
        name,
        amount,
        spent: 0,
        subItems: [],
        isImpulse
      }
    ]);
  };

  const addSubItem = (budgetItemId: string, name: string, amount: number) => {
    setBudgetItems(budgetItems.map(item => {
      if (item.id === budgetItemId) {
        const newSubItem: SubBudgetItem = {
          id: Date.now().toString(),
          name,
          amount
        };
        return {
          ...item,
          subItems: [...item.subItems, newSubItem]
        };
      }
      return item;
    }));
  };

  const deleteSubItem = (budgetItemId: string, subItemId: string) => {
    setBudgetItems(budgetItems.map(item => {
      if (item.id === budgetItemId) {
        return {
          ...item,
          subItems: item.subItems.filter(subItem => subItem.id !== subItemId)
        };
      }
      return item;
    }));
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(
      budgetItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const updateSubItem = (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => {
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
        addSubItem,
        deleteSubItem,
        updateSubItem,
        addExpense,
        resetBudget,
        getRemainingBudget,
        getTotalSpent,
        getTotalAllocated,
        updateItemDeadline
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

