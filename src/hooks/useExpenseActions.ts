import { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import * as expenseService from '@/services/expenseService';

interface UseExpenseActionsProps {
  toast: any;
  loadBudget: () => Promise<void>; // Changed from Promise<boolean> to Promise<void>
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  currentBudgetId: string | null;
  budgetItems: BudgetItem[];
}

export const useExpenseActions = ({
  toast,
  loadBudget,
  setBudgetItems,
  currentBudgetId,
  budgetItems
}: UseExpenseActionsProps) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const addExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Expense amount must be a positive number.",
        variant: "destructive"
      });
      return;
    }

    if (!currentBudgetId) {
      toast({
        title: "Error adding expense",
        description: "No current budget found",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingExpense(true);
      
      if (subItemIds && subItemIds.length > 1) {
        // Handle multiple sub-items - we need to get the individual amounts
        // For now, split the total amount equally among sub-items
        console.log('Adding multiple expenses:', { itemId, amount, subItemIds });
        
        // Get the selected item to find sub-item details
        const selectedItem = budgetItems.find(item => item.id === itemId);
        if (!selectedItem) {
          throw new Error("Selected budget item not found");
        }
        
        // Calculate individual amounts based on sub-item budgets
        const selectedSubItems = selectedItem.subItems.filter(sub => subItemIds.includes(sub.id));
        const totalBudgetedAmount = selectedSubItems.reduce((total, sub) => total + sub.amount, 0);
        
        const subItemAmounts = selectedSubItems.map(subItem => ({
          subItemId: subItem.id,
          amount: totalBudgetedAmount > 0 ? (subItem.amount / totalBudgetedAmount) * amount : amount / selectedSubItems.length
        }));
        
        await expenseService.addMultipleExpenses(itemId, subItemAmounts);
      } else {
        // Handle single sub-item or no sub-item
        const subItemId = subItemIds && subItemIds.length > 0 ? subItemIds[0] : undefined;
        console.log('Adding single expense:', { itemId, amount, subItemId });
        
        await expenseService.addExpense(itemId, amount, subItemId);
      }
      
      console.log('Expense(s) added successfully, reloading budget...');
      
      // Reload the budget to get updated spent amounts
      await loadBudget();
      
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAddingExpense(false);
    }
  };

  return {
    addExpense,
    isAddingExpense
  };
};
