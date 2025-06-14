
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
    console.error("Error creating sub-item:", error);
    throw new Error('Could not create the sub-item. Please try again.');
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
    console.error("Error updating sub-item:", error);
    throw new Error('Could not update the sub-item. Please try again.');
  }

  return true;
};

export const deleteSubItem = async (id: string) => {
  const { error } = await supabase
    .from('budget_sub_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting sub-item:", error);
    throw new Error('Could not delete the sub-item. Please try again.');
  }

  return true;
};
