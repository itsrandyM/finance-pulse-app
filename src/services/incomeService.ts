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
    console.error("Error getting income entries:", error);
    throw new Error('Could not retrieve income entries.');
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
    console.error("Error creating income entry:", error);
    throw new Error('Could not create the income entry. Please try again.');
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
    console.error("Error deleting income entry:", error);
    throw new Error('Could not delete the income entry. Please try again.');
  }

  return true;
};

// Calculate total income
export const getTotalIncome = async () => {
  const entries = await getIncomeEntries();
  return entries.reduce((total, entry) => total + Number(entry.amount), 0);
};
