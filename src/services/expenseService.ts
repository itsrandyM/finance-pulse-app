
import { supabase } from '@/integrations/supabase/client';

export const addExpense = async (
  budgetItemId: string,
  amount: number,
  subItemIds?: string[]
) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // If sub-item IDs are provided, add an expense for each sub-item
  if (subItemIds && subItemIds.length > 0) {
    const subItemExpensePromises = subItemIds.map(subItemId =>
      supabase
        .from('expenses')
        .insert({
          user_id: userId,
          budget_item_id: budgetItemId,
          sub_item_id: subItemId,
          amount: amount / subItemIds.length // Divide the amount equally
        })
    );
    
    await Promise.all(subItemExpensePromises);
  } else {
    // Add a single expense for the budget item
    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        budget_item_id: budgetItemId,
        amount
      });
      
    if (error) {
      throw new Error(`Failed to add expense: ${error.message}`);
    }
  }
  
  // Update the spent amount on the budget item
  await updateBudgetItemSpent(budgetItemId);
  
  return true;
};

export const updateBudgetItemSpent = async (budgetItemId: string) => {
  // Call the Supabase function to update the spent amount
  const { error } = await supabase.rpc('update_budget_item_spent', {
    budget_item_id: budgetItemId
  });
  
  if (error) {
    throw new Error(`Failed to update spent amount: ${error.message}`);
  }
  
  return true;
};

export const getExpensesBySubItem = async (subItemId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('sub_item_id', subItemId);
    
  if (error) {
    throw new Error(`Failed to get expenses: ${error.message}`);
  }
  
  return data || [];
};
