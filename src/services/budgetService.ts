
import { supabase } from '@/integrations/supabase/client';
import { BudgetPeriod } from '@/types/budget';
import { getBudgetItems } from './budgetItemService';
import { addExpense, getExpensesBySubItem } from './expenseService';

export {
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  createSubItem,
  deleteSubItem,
  updateSubItem
} from './budgetItemService';

export {
  addExpense,
  getExpensesBySubItem
} from './expenseService';

// Core budget operations
export const createBudget = async (period: BudgetPeriod, totalBudget: number) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      period,
      total_budget: totalBudget,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create budget: ${error.message}`);
  }

  return data;
};

export const getCurrentBudget = async () => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No budget found - not an error
      return null;
    }
    throw new Error(`Failed to get current budget: ${error.message}`);
  }

  return data;
};
