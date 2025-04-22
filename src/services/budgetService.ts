
import { supabase } from '@/integrations/supabase/client';
import { BudgetPeriod, SubBudgetItem } from '@/contexts/BudgetContext';
import { Database } from '@/integrations/supabase/types';

// Types for better type safety
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

// Budget operations
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

// Budget items operations
export const getBudgetItems = async (budgetId: string) => {
  // First get the budget items
  const { data: itemsData, error: itemsError } = await supabase
    .from('budget_items')
    .select('*')
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: false });

  if (itemsError) {
    throw new Error(`Failed to get budget items: ${itemsError.message}`);
  }

  // Now get the sub-items for each budget item
  const subItemsPromises = itemsData.map(async (item) => {
    const { data: subItemsData, error: subItemsError } = await supabase
      .from('budget_sub_items')
      .select('*')
      .eq('budget_item_id', item.id)
      .order('created_at', { ascending: false });

    if (subItemsError) {
      throw new Error(`Failed to get sub-items: ${subItemsError.message}`);
    }

    return { 
      ...item, 
      sub_items: subItemsData
    };
  });

  // Wait for all sub-item queries to complete
  const itemsWithSubItems = await Promise.all(subItemsPromises);

  return itemsWithSubItems;
};

export const createBudgetItem = async (
  budgetId: string,
  name: string,
  amount: number,
  isImpulse: boolean = false
) => {
  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      budget_id: budgetId,
      name,
      amount,
      is_impulse: isImpulse
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create budget item: ${error.message}`);
  }

  return data;
};

export const updateBudgetItem = async (
  id: string, 
  updates: any
) => {
  const { error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update budget item: ${error.message}`);
  }

  return true;
};

export const deleteBudgetItem = async (id: string) => {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete budget item: ${error.message}`);
  }

  return true;
};

// Sub-item operations
export const createSubItem = async (
  budgetItemId: string,
  name: string,
  amount: number
) => {
  const { data, error } = await supabase
    .from('budget_sub_items')
    .insert({
      budget_item_id: budgetItemId,
      name,
      amount
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create sub-item: ${error.message}`);
  }

  return data;
};

export const deleteSubItem = async (id: string) => {
  const { error } = await supabase
    .from('budget_sub_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete sub-item: ${error.message}`);
  }

  return true;
};

export const updateSubItem = async (
  id: string, 
  updates: Partial<SubBudgetItem>
) => {
  const { error } = await supabase
    .from('budget_sub_items')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update sub-item: ${error.message}`);
  }

  return true;
};

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

  // Create a properly typed expense data object
  const baseExpenseData: Omit<ExpenseInsert, 'sub_item_id'> = {
    budget_item_id: budgetItemId,
    amount,
    user_id: userId
  };

  // If sub-item IDs are specified, add multiple expense records
  if (subItemIds && subItemIds.length > 0) {
    // Create multiple expense records, one for each subItemId
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
    // No sub-items, just add a single expense without sub_item_id
    const { error } = await supabase
      .from('expenses')
      .insert(baseExpenseData);

    if (error) {
      throw new Error(`Failed to add expense: ${error.message}`);
    }
  }

  // Call the RPC to update the spent amount in the budget item
  const { error: updateError } = await supabase.rpc('update_budget_item_spent', {
    p_budget_item_id: budgetItemId
  });

  if (updateError) {
    throw new Error(`Failed to update budget item spent amount: ${updateError.message}`);
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
