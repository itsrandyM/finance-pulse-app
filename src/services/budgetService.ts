
import { supabase } from '@/integrations/supabase/client';
import { BudgetPeriod } from '@/contexts/BudgetContext';

export async function createBudget(period: BudgetPeriod, totalBudget: number) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.user.id,
      period: period,
      total_budget: totalBudget,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentBudget() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // Get the most recent budget for the current user
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error

  return data;
}

export async function getBudgetItems(budgetId: string) {
  const { data, error } = await supabase
    .from('budget_items')
    .select(`
      *,
      sub_items:budget_sub_items(*)
    `)
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBudgetItem(budgetId: string, name: string, amount: number, isImpulse: boolean = false) {
  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      budget_id: budgetId,
      name,
      amount,
      is_impulse: isImpulse,
      spent: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetItem(itemId: string, updates: any) {
  const { data, error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetItem(itemId: string) {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function createSubItem(budgetItemId: string, name: string, amount: number, note?: string, tag?: string) {
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

  if (error) throw error;
  return data;
}

export async function updateSubItem(subItemId: string, updates: any) {
  const { data, error } = await supabase
    .from('budget_sub_items')
    .update(updates)
    .eq('id', subItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubItem(subItemId: string) {
  const { error } = await supabase
    .from('budget_sub_items')
    .delete()
    .eq('id', subItemId);

  if (error) throw error;
}

export async function addExpense(budgetItemId: string, amount: number, subItemId?: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // First, create the expense record
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      user_id: user.user.id,
      budget_item_id: budgetItemId,
      sub_item_id: subItemId || null,
      amount
    })
    .select()
    .single();

  if (expenseError) throw expenseError;

  // Then, update the spent amount on the budget item
  const { data: budgetItem, error: budgetItemError } = await supabase
    .from('budget_items')
    .select('spent')
    .eq('id', budgetItemId)
    .single();

  if (budgetItemError) throw budgetItemError;

  const newSpent = parseFloat(budgetItem.spent) + amount;
  const { error: updateError } = await supabase
    .from('budget_items')
    .update({ spent: newSpent })
    .eq('id', budgetItemId);

  if (updateError) throw updateError;

  return expense;
}

export async function getExpensesByBudgetItem(budgetItemId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('budget_item_id', budgetItemId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getExpensesBySubItem(subItemId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('sub_item_id', subItemId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
