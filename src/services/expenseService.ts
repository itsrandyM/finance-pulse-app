import { supabase } from '@/integrations/supabase/client';
import {
  getUserId,
  insertExpenseRecord,
  insertMultipleExpenseRecords,
  updateBudgetItemSpent,
  waitForDatabaseConsistency,
  getUpdatedSpentAmount,
  getUserBudgets,
  getBudgetItemsForBudgets
} from './expenseHelpers';

export const addExpense = async (
  budgetItemId: string,
  amount: number,
  subItemId?: string
) => {
  const userId = await getUserId();
  
  try {
    console.log("=== EXPENSE SERVICE START ===");
    console.log("Adding expense to database:", { budgetItemId, amount, subItemId });
    
    await insertExpenseRecord(budgetItemId, amount, userId, subItemId);
    console.log("Expense inserted successfully, now updating spent amount...");
    
    await updateBudgetItemSpent(budgetItemId);
    console.log("Spent amount updated via database function");
    
    await waitForDatabaseConsistency();
    
    const newSpent = await getUpdatedSpentAmount(budgetItemId);
    console.log("Updated item spent amount from database:", newSpent);
    console.log("=== EXPENSE SERVICE COMPLETE ===");
    
    return { success: true, newSpent };
  } catch (error: any) {
    console.error("=== EXPENSE SERVICE ERROR ===", error);
    throw error;
  }
};

export const addMultipleExpenses = async (
  budgetItemId: string,
  subItemAmounts: { subItemId: string; amount: number }[]
) => {
  const userId = await getUserId();
  
  try {
    console.log("=== MULTIPLE EXPENSES SERVICE START ===");
    console.log("Adding multiple expenses:", { budgetItemId, subItemAmounts });
    
    await insertMultipleExpenseRecords(budgetItemId, subItemAmounts, userId);
    console.log("Multiple expenses inserted successfully, now updating spent amount...");
    
    await updateBudgetItemSpent(budgetItemId);
    console.log("Spent amount updated via database function");
    
    await waitForDatabaseConsistency();
    
    const newSpent = await getUpdatedSpentAmount(budgetItemId);
    console.log("Updated item spent amount from database:", newSpent);
    console.log("=== MULTIPLE EXPENSES SERVICE COMPLETE ===");
    
    return { success: true, newSpent };
  } catch (error: any) {
    console.error("=== MULTIPLE EXPENSES SERVICE ERROR ===", error);
    throw new Error(`Failed to add multiple expenses: ${error.message}`);
  }
};

export const recalculateAllSpentAmounts = async () => {
  const userId = await getUserId();
  
  try {
    const budgets = await getUserBudgets(userId);
    const budgetItems = await getBudgetItemsForBudgets(budgets.map(b => b.id));
    
    await Promise.all(
      budgetItems.map(item => updateBudgetItemSpent(item.id))
    );
    
    console.log("All spent amounts recalculated successfully");
    return true;
  } catch (error: any) {
    console.error("Error recalculating spent amounts:", error);
    throw error;
  }
};

export const getExpensesByItem = async (budgetItemId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('budget_item_id', budgetItemId);
  
  if (error) {
    console.error("Error getting expenses:", error);
    throw new Error('Could not retrieve expenses for this item.');
  }
  
  return data;
};

export const getExpensesBySubItem = async (subItemId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('sub_item_id', subItemId);
  
  if (error) {
    console.error("Error getting sub-item expenses:", error);
    throw new Error('Could not retrieve expenses for this sub-item.');
  }
  
  return data;
};
