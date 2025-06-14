
import { supabase } from '@/integrations/supabase/client';

export const getUserId = async (): Promise<string> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  return userId;
};

export const insertExpenseRecord = async (
  budgetItemId: string,
  amount: number,
  userId: string,
  subItemId?: string
) => {
  const { error } = await supabase
    .from('expenses')
    .insert({
      budget_item_id: budgetItemId,
      sub_item_id: subItemId,
      amount: amount,
      user_id: userId
    });
    
  if (error) {
    console.error("Error adding expense:", error);
    throw new Error('Could not add expense due to a database error.');
  }
};

export const insertMultipleExpenseRecords = async (
  budgetItemId: string,
  subItemAmounts: { subItemId: string; amount: number }[],
  userId: string
) => {
  const expenseRecords = subItemAmounts.map(({ subItemId, amount }) => ({
    budget_item_id: budgetItemId,
    sub_item_id: subItemId,
    amount: amount,
    user_id: userId
  }));
  
  const { error } = await supabase
    .from('expenses')
    .insert(expenseRecords);
    
  if (error) {
    console.error("Error adding multiple expenses:", error);
    throw new Error(`Error adding expenses: ${error.message}`);
  }
};

export const updateBudgetItemSpent = async (budgetItemId: string) => {
  const { error } = await supabase.rpc('update_budget_item_spent', {
    p_budget_item_id: budgetItemId
  });
  
  if (error) {
    console.error("Error updating spent amount:", error);
    throw new Error('Could not update spent amount.');
  }
};

export const waitForDatabaseConsistency = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const getUpdatedSpentAmount = async (budgetItemId: string): Promise<number> => {
  const { data: updatedItem, error } = await supabase
    .from('budget_items')
    .select('spent')
    .eq('id', budgetItemId)
    .single();
  
  if (error) {
    console.error("Error fetching updated item:", error);
    throw new Error('Could not fetch updated item information.');
  }
  
  return parseFloat(updatedItem.spent?.toString() || '0') || 0;
};

export const getUserBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Error fetching budgets: ${error.message}`);
  }
  
  return data;
};

export const getBudgetItemsForBudgets = async (budgetIds: string[]) => {
  const { data, error } = await supabase
    .from('budget_items')
    .select('id')
    .in('budget_id', budgetIds);
  
  if (error) {
    throw new Error(`Error fetching budget items: ${error.message}`);
  }
  
  return data;
};
