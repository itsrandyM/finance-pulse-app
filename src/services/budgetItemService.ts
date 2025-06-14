import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Types for better type safety
export type BudgetItemUpdate = Partial<Database['public']['Tables']['budget_items']['Update']> & { 
  isContinuous?: boolean;
  isImpulse?: boolean;
  isRecurring?: boolean;
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
    console.error("Error getting budget items:", itemsError);
    throw new Error('Failed to retrieve budget items.');
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
      console.error(`Failed to get sub-items for item ${item.id}:`, subItemsError);
      // Continue without sub-items for this item, but log the error
      return { ...item, sub_items: [] };
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
  isContinuous: boolean = false,
  isRecurring: boolean = false
) => {
  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      budget_id: budgetId,
      name,
      amount,
      is_impulse: isImpulse,
      is_continuous: isContinuous,
      is_recurring: isRecurring
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating budget item:", error);
    throw new Error('Could not create the budget item. Please try again.');
  }

  return data;
};

export const updateBudgetItem = async (id: string, updates: BudgetItemUpdate) => {
  const dbUpdates: Record<string, any> = { ...updates };
  
  // Handle deadline value with proper type checking
  if ('deadline' in updates) {
    const deadlineValue = updates.deadline;
    
    if (deadlineValue === null || deadlineValue === undefined) {
      dbUpdates.deadline = null;
    } else if (typeof deadlineValue === 'string') {
      dbUpdates.deadline = deadlineValue;
    } else if (deadlineValue && typeof deadlineValue === 'object' && 'toISOString' in deadlineValue) {
      dbUpdates.deadline = (deadlineValue as Date).toISOString();
    } else {
      dbUpdates.deadline = null;
    }
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

  // Handle isRecurring -> is_recurring mapping
  if ('isRecurring' in updates) {
    dbUpdates.is_recurring = updates.isRecurring;
    delete dbUpdates.isRecurring;
  }

  const { error } = await supabase
    .from('budget_items')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error("Error updating budget item:", error);
    throw new Error('Could not update the budget item. Please try again.');
  }

  return true;
};

export const deleteBudgetItem = async (id: string) => {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting budget item:", error);
    throw new Error('Could not delete the budget item. Please try again.');
  }

  return true;
};

export const getExpensesForRecurringItem = async (itemName: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Fetch all budgets for the user to get their IDs
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id);
  
  if (budgetsError) {
    console.error("Error fetching user budgets:", budgetsError);
    throw new Error('Failed to retrieve user budgets.');
  }

  if (!budgets || budgets.length === 0) {
    return []; // No budgets, so no expenses
  }
  const budgetIds = budgets.map(b => b.id);

  // Fetch all budget items with the given name from those budgets
  const { data: budgetItems, error: itemsError } = await supabase
    .from('budget_items')
    .select('id')
    .in('budget_id', budgetIds)
    .eq('name', itemName);
    
  if (itemsError) {
    console.error("Error fetching budget items by name:", itemsError);
    throw new Error('Failed to retrieve budget items.');
  }

  if (!budgetItems || budgetItems.length === 0) {
    return []; // No items with that name
  }
  const budgetItemIds = budgetItems.map(item => item.id);

  // Fetch all sub-items for these budget items to map their names later
  const { data: subItems, error: subItemError } = await supabase
    .from('budget_sub_items')
    .select('id, name')
    .in('budget_item_id', budgetItemIds);

  if (subItemError) {
    console.error("Error fetching sub-items:", subItemError);
    // We can continue without sub-item names, but log the error
  }
  
  const subItemMap = new Map(subItems?.map(s => [s.id, s.name]));

  // Fetch all expenses for those budget items
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .in('budget_item_id', budgetItemIds)
    .order('created_at', { ascending: false });

  if (expensesError) {
    console.error("Error fetching expenses:", expensesError);
    throw new Error('Failed to retrieve expenses.');
  }

  if (!expenses) {
    return [];
  }

  // Process expenses to add names
  const processedExpenses = expenses.map(expense => ({
    ...expense,
    budget_item_name: itemName,
    sub_item_name: expense.sub_item_id ? subItemMap.get(expense.sub_item_id) : undefined
  }));

  return processedExpenses;
};
