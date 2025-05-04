
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Types for better type safety
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

// Expense operations
export const addExpense = async (
  budgetItemId: string, 
  amount: number,
  subItemIds?: string[]
) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Adding expense of ${amount} to budget item ${budgetItemId}`);
  console.log(`Sub-item IDs: ${subItemIds?.join(', ') || 'none'}`);

  const baseExpenseData: Omit<ExpenseInsert, 'sub_item_id'> = {
    budget_item_id: budgetItemId,
    amount,
    user_id: userId
  };

  // Insert expenses
  if (subItemIds && subItemIds.length > 0) {
    // Add for each sub-item
    for (const subItemId of subItemIds) {
      const expenseData: ExpenseInsert = {
        ...baseExpenseData,
        sub_item_id: subItemId
      };

      const { error } = await supabase
        .from('expenses')
        .insert(expenseData);

      if (error) {
        throw new Error(`Failed to add expense: ${error.message}`);
      }
    }
  } else {
    // No sub-items, just add a single expense
    const { error } = await supabase
      .from('expenses')
      .insert(baseExpenseData);

    if (error) {
      throw new Error(`Failed to add expense: ${error.message}`);
    }
  }

  // Directly update spent amount on budget_items table
  // 1. Get total spent for this budgetItemId from expenses
  const { data: sumData, error: sumError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('budget_item_id', budgetItemId);

  if (sumError) {
    throw new Error(`Failed to sum expenses: ${sumError.message}`);
  }

  const totalSpent = Array.isArray(sumData)
    ? sumData.reduce((sum, curr) => sum + (typeof curr.amount === 'number' ? curr.amount : parseFloat(curr.amount)), 0)
    : 0;

  // 2. Update budget_items.spent
  const { error: updateError } = await supabase
    .from('budget_items')
    .update({ spent: totalSpent })
    .eq('id', budgetItemId);

  if (updateError) {
    throw new Error(`Failed to update budget item spent amount: ${updateError.message}`);
  }

  console.log("Expense added and budget item spent updated successfully");
  return true;
};
