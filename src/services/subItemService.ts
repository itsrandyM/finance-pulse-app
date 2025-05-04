
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Type for better type safety
type SubItemUpdate = Partial<Database['public']['Tables']['budget_sub_items']['Update']>;

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
  updates: SubItemUpdate
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
