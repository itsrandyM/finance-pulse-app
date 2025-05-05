import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Types for better type safety
export type BudgetItemUpdate = Partial<Database['public']['Tables']['budget_items']['Update']> & { 
  isContinuous?: boolean;
  isImpulse?: boolean;
  deadline?: Date | null | string;
};

export const getBudgetItems = async (budgetId: string) => {
  console.log(`Getting budget items for budget ${budgetId}`);
  
  // First get the budget items
  const { data: itemsData, error: itemsError } = await supabase
    .from('budget_items')
    .select('*')
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: false });

  if (itemsError) {
    throw new Error(`Failed to get budget items: ${itemsError.message}`);
  }

  console.log(`Found ${itemsData.length} budget items`);

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
  
  console.log("All budget items with sub-items:", itemsWithSubItems);
  return itemsWithSubItems;
};

export const createBudgetItem = async (
  budgetId: string,
  name: string,
  amount: number,
  isImpulse: boolean = false,
  isContinuous: boolean = false
) => {
  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      budget_id: budgetId,
      name,
      amount,
      is_impulse: isImpulse,
      is_continuous: isContinuous
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create budget item: ${error.message}`);
  }

  return data;
};

export const updateBudgetItem = async (id: string, updates: BudgetItemUpdate) => {
  const dbUpdates: Record<string, any> = { ...updates };
  
  // Handle deadline value - ensure it's converted to ISO string only if it exists and is a Date
  if ('deadline' in updates) {
    if (updates.deadline === null) {
      dbUpdates.deadline = null;
    } else if (updates.deadline instanceof Date) {
      dbUpdates.deadline = updates.deadline.toISOString();
    }
    // If it's already a string, keep it as is
  }
  
  // Handle isContinuous -> is_continuous mapping
  if ('isContinuous' in updates) {
    dbUpdates.is_continuous = updates.isContinuous;
    delete dbUpdates.isContinuous;
  }
  
  // Handle isImpulse -> is_impulse mapping
  if ('isImpulse' in updates) {
    dbUpdates.is_impulse = updates.isImpulse;
    delete dbUpdates.isImpulse;
  }

  const { error } = await supabase
    .from('budget_items')
    .update(dbUpdates)
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
