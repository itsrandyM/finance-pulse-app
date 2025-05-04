
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
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get current budget: ${error.message}`);
  }

  return data;
};
