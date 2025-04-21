
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import * as budgetService from '@/services/budgetService';

export type BudgetPeriod = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'custom';

export type TagOption = string | null;

export interface SubBudgetItem {
  id: string;
  name: string;
  amount: number;
  note?: string;
  tag?: TagOption;
  hasExpenses?: boolean;
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
  addBudgetItem: (name: string, amount: number, isImpulse: boolean) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
  addSubItem: (budgetItemId: string, name: string, amount: number) => Promise<void>;
  deleteSubItem: (budgetItemId: string, subItemId: string) => Promise<void>;
  updateSubItem: (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => Promise<void>;
  addExpense: (itemId: string, amount: number, subItemIds?: string[]) => Promise<void>;
  resetBudget: () => void;
  getRemainingBudget: () => number;
  getTotalSpent: () => number;
  getTotalAllocated: () => number;
  updateItemDeadline: (itemId: string, deadline: Date) => Promise<void>;
  isLoading: boolean;
  currentBudgetId: string | null;
  initializeBudget: (period: BudgetPeriod, amount: number) => Promise<void>;
  loadBudget: () => Promise<boolean>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [period, setPeriodState] = useState<BudgetPeriod | null>(null);
  const [totalBudget, setTotalBudgetState] = useState<number>(0);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user's budget when they log in
  useEffect(() => {
    if (user) {
      loadBudget().catch(error => {
        console.error("Failed to load budget:", error);
      });
    }
  }, [user]);

  // Initialize a new budget
  const initializeBudget = async (budgetPeriod: BudgetPeriod, amount: number) => {
    try {
      setIsLoading(true);
      const budget = await budgetService.createBudget(budgetPeriod, amount);
      setCurrentBudgetId(budget.id);
      setPeriodState(budgetPeriod as BudgetPeriod);
      setTotalBudgetState(amount);
      setBudgetItems([]);
      return budget;
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

  // Load the user's current budget
  const loadBudget = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      const budget = await budgetService.getCurrentBudget();
      
      if (!budget) {
        // No budget found
        return false;
      }
      
      setCurrentBudgetId(budget.id);
      setPeriodState(budget.period as BudgetPeriod);
      setTotalBudgetState(budget.total_budget);
      
      // Load budget items
      const items = await budgetService.getBudgetItems(budget.id);
      
      // Process items to match our interface
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
          note: item.note || undefined,
          tag: item.tag || null,
        };
      });
      
      setBudgetItems(processedItems);
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

  const setPeriod = (newPeriod: BudgetPeriod) => {
    setPeriodState(newPeriod);
  };

  const setTotalBudget = (amount: number) => {
    setTotalBudgetState(amount);
  };

  const updateItemDeadline = async (itemId: string, deadline: Date) => {
    try {
      await budgetService.updateBudgetItem(itemId, { deadline });
      setBudgetItems(
        budgetItems.map(item =>
          item.id === itemId ? { ...item, deadline } : item
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating deadline",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addBudgetItem = async (name: string, amount: number, isImpulse: boolean = false) => {
    if (!currentBudgetId) {
      toast({
        title: "Error adding budget item",
        description: "No current budget found",
        variant: "destructive"
      });
      return;
    }

    try {
      const newItem = await budgetService.createBudgetItem(
        currentBudgetId, 
        name, 
        amount, 
        isImpulse
      );
      
      setBudgetItems([
        ...budgetItems,
        {
          id: newItem.id,
          name: newItem.name,
          amount: newItem.amount,
          spent: 0,
          subItems: [],
          isImpulse: newItem.is_impulse
        }
      ]);
    } catch (error: any) {
      toast({
        title: "Error adding budget item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addSubItem = async (budgetItemId: string, name: string, amount: number) => {
    try {
      const newSubItem = await budgetService.createSubItem(budgetItemId, name, amount);
      
      setBudgetItems(budgetItems.map(item => {
        if (item.id === budgetItemId) {
          return {
            ...item,
            subItems: [...item.subItems, {
              id: newSubItem.id,
              name: newSubItem.name,
              amount: newSubItem.amount,
              note: newSubItem.note,
              tag: newSubItem.tag,
              hasExpenses: false
            }]
          };
        }
        return item;
      }));
    } catch (error: any) {
      toast({
        title: "Error adding sub-item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSubItem = async (budgetItemId: string, subItemId: string) => {
    try {
      await budgetService.deleteSubItem(subItemId);
      
      setBudgetItems(budgetItems.map(item => {
        if (item.id === budgetItemId) {
          return {
            ...item,
            subItems: item.subItems.filter(subItem => subItem.id !== subItemId)
          };
        }
        return item;
      }));
    } catch (error: any) {
      toast({
        title: "Error deleting sub-item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      // Format updates to match DB schema
      const dbUpdates: any = { ...updates };
      if (updates.deadline) {
        dbUpdates.deadline = updates.deadline;
      }
      if (updates.isImpulse !== undefined) {
        dbUpdates.is_impulse = updates.isImpulse;
      }
      
      await budgetService.updateBudgetItem(id, dbUpdates);
      
      setBudgetItems(
        budgetItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating budget item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSubItem = async (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => {
    try {
      await budgetService.updateSubItem(subItemId, updates);
      
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
    } catch (error: any) {
      toast({
        title: "Error updating sub-item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteBudgetItem = async (id: string) => {
    try {
      await budgetService.deleteBudgetItem(id);
      setBudgetItems(budgetItems.filter(item => item.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting budget item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      if (subItemIds && subItemIds.length > 0) {
        // If specific sub-items are being expensed
        for (const subItemId of subItemIds) {
          await budgetService.addExpense(itemId, amount, subItemId);
        }
      } else {
        // Adding expense to the main item
        await budgetService.addExpense(itemId, amount);
      }
      
      setBudgetItems(
        budgetItems.map(item => {
          if (item.id === itemId) {
            const newItem = { ...item, spent: item.spent + amount };

            // Mark sub-items as having expenses
            if (subItemIds && subItemIds.length > 0) {
              newItem.subItems = item.subItems.map(subItem => 
                subItemIds.includes(subItem.id) 
                  ? { ...subItem, hasExpenses: true } 
                  : subItem
              );
            }
            
            return newItem;
          }
          return item;
        })
      );
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetBudget = () => {
    setPeriodState(null);
    setTotalBudgetState(0);
    setBudgetItems([]);
    setCurrentBudgetId(null);
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
        updateItemDeadline,
        isLoading,
        currentBudgetId,
        initializeBudget,
        loadBudget
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
