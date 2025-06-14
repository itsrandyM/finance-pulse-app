
import { supabase } from '@/integrations/supabase/client';
import { BudgetPeriod } from '@/types/budget';

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
    console.error("Error creating budget:", error);
    throw new Error('Could not create the new budget. Please try again.');
  }

  return data;
};

export const getCurrentBudget = async () => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error getting current budget:", error);
    throw new Error('Could not retrieve budget information. Please try again.');
  }

  return data;
};
