
import { supabase } from '@/integrations/supabase/client';
import { SubBudgetItem } from '@/types/budget';

export const createSubItem = async (
  budgetItemId: string,
  name: string,
  amount: number,
  note?: string,
  tag?: string | null
) => {
  const { data, error } = await supabase
    .from('budget_sub_items')
    .insert({
      budget_item_id: budgetItemId,
      name,
      amount,
      note,
      tag
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create sub-item: ${error.message}`);
  }

  return data;
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
