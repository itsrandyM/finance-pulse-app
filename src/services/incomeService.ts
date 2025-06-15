
import { supabase } from '@/integrations/supabase/client';

export type IncomeEntry = {
  id: string;
  name: string;
  amount: number;
  created_at: string;
  budget_period_start: string;
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

// Get income entries for a specific budget period
export const getIncomeEntriesForPeriod = async (budgetPeriodStart: string) => {
  const { data, error } = await supabase
    .from('income_entries')
    .select('*')
    .eq('budget_period_start', budgetPeriodStart)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error getting income entries for period:", error);
    throw new Error('Could not retrieve income entries for this budget period.');
  }

  return data as IncomeEntry[];
};

// Create a new income entry with budget period tracking
export const createIncomeEntry = async (name: string, amount: number, budgetPeriodStart?: string) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Use provided budget period start or current timestamp
  const periodStart = budgetPeriodStart || new Date().toISOString();

  const { data, error } = await supabase
    .from('income_entries')
    .insert({
      name,
      amount,
      user_id: userId,
      budget_period_start: periodStart
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

// Calculate total income for all entries
export const getTotalIncome = async () => {
  const entries = await getIncomeEntries();
  return entries.reduce((total, entry) => total + Number(entry.amount), 0);
};

// Calculate total income for a specific budget period
export const getTotalIncomeForPeriod = async (budgetPeriodStart: string) => {
  const entries = await getIncomeEntriesForPeriod(budgetPeriodStart);
  return entries.reduce((total, entry) => total + Number(entry.amount), 0);
};
