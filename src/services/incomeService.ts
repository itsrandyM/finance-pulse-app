
import { supabase } from '@/integrations/supabase/client';

export type IncomeEntry = {
  id: string;
  name: string;
  amount: number;
  created_at: string;
};

// Get all income entries for the current user
export const getIncomeEntries = async () => {
  const { data, error } = await supabase
    .from('income_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get income entries: ${error.message}`);
  }

  return data as IncomeEntry[];
};

// Create a new income entry
export const createIncomeEntry = async (name: string, amount: number) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('income_entries')
    .insert({
      name,
      amount,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create income entry: ${error.message}`);
  }

  return data as IncomeEntry;
};

// Delete an income entry
export const deleteIncomeEntry = async (id: string) => {
  const { error } = await supabase
    .from('income_entries')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete income entry: ${error.message}`);
  }

  return true;
};

// Calculate total income
export const getTotalIncome = async () => {
  const entries = await getIncomeEntries();
  return entries.reduce((total, entry) => total + Number(entry.amount), 0);
};
