import { supabase } from '@/integrations/supabase/client';

export const addExpense = async (
  budgetItemId: string,
  amount: number,
  subItemId?: string
) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  try {
    console.log("=== EXPENSE SERVICE START ===");
    console.log("Adding expense to database:", { budgetItemId, amount, subItemId });
    
    // Logic is now simpler: insert one expense record with an optional sub_item_id
    const { error } = await supabase
      .from('expenses')
      .insert({
        budget_item_id: budgetItemId,
        sub_item_id: subItemId, // This can be null
        amount: amount,
        user_id: userId
      });
      
    if (error) {
      console.error("Error adding expense:", error);
      throw new Error(`Error adding expense: ${error.message}`);
    }
    
    console.log("Expense inserted successfully, now updating spent amount...");
    
    // Update the spent amount for the budget item using the database function with correct parameter name
    const { error: updateError } = await supabase.rpc('update_budget_item_spent', {
      p_budget_item_id: budgetItemId
    });
    
    if (updateError) {
      console.error("Error updating spent amount:", updateError);
      throw new Error(`Error updating spent amount: ${updateError.message}`);
    }
    
    console.log("Spent amount updated via database function");
    
    // Add a small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the updated budget item to return the new spent amount
    const { data: updatedItem, error: fetchError } = await supabase
      .from('budget_items')
      .select('spent')
      .eq('id', budgetItemId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching updated item:", fetchError);
      throw new Error(`Error fetching updated item: ${fetchError.message}`);
    }
    
    console.log("Updated item spent amount from database:", updatedItem.spent);
    console.log("=== EXPENSE SERVICE COMPLETE ===");
    
    // Ensure we return a proper number
    const newSpent = parseFloat(updatedItem.spent?.toString() || '0') || 0;
    
    return { success: true, newSpent };
  } catch (error: any) {
    console.error("=== EXPENSE SERVICE ERROR ===", error);
    throw new Error(`Failed to add expense: ${error.message}`);
  }
};

export const addMultipleExpenses = async (
  budgetItemId: string,
  subItemAmounts: { subItemId: string; amount: number }[]
) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  try {
    console.log("=== MULTIPLE EXPENSES SERVICE START ===");
    console.log("Adding multiple expenses:", { budgetItemId, subItemAmounts });
    
    // Insert multiple expense records in a single transaction
    const expenseRecords = subItemAmounts.map(({ subItemId, amount }) => ({
      budget_item_id: budgetItemId,
      sub_item_id: subItemId,
      amount: amount,
      user_id: userId
    }));
    
    const { error } = await supabase
      .from('expenses')
      .insert(expenseRecords);
      
    if (error) {
      console.error("Error adding multiple expenses:", error);
      throw new Error(`Error adding expenses: ${error.message}`);
    }
    
    console.log("Multiple expenses inserted successfully, now updating spent amount...");
    
    // Update the spent amount for the budget item
    const { error: updateError } = await supabase.rpc('update_budget_item_spent', {
      p_budget_item_id: budgetItemId
    });
    
    if (updateError) {
      console.error("Error updating spent amount:", updateError);
      throw new Error(`Error updating spent amount: ${updateError.message}`);
    }
    
    console.log("Spent amount updated via database function");
    
    // Add a small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the updated budget item to return the new spent amount
    const { data: updatedItem, error: fetchError } = await supabase
      .from('budget_items')
      .select('spent')
      .eq('id', budgetItemId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching updated item:", fetchError);
      throw new Error(`Error fetching updated item: ${fetchError.message}`);
    }
    
    console.log("Updated item spent amount from database:", updatedItem.spent);
    console.log("=== MULTIPLE EXPENSES SERVICE COMPLETE ===");
    
    const newSpent = parseFloat(updatedItem.spent?.toString() || '0') || 0;
    
    return { success: true, newSpent };
  } catch (error: any) {
    console.error("=== MULTIPLE EXPENSES SERVICE ERROR ===", error);
    throw new Error(`Failed to add multiple expenses: ${error.message}`);
  }
};

export const recalculateAllSpentAmounts = async () => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  try {
    // Get all budget items for the current user
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId);
    
    if (budgetError) {
      throw new Error(`Error fetching budgets: ${budgetError.message}`);
    }
    
    const { data: budgetItems, error: itemsError } = await supabase
      .from('budget_items')
      .select('id')
      .in('budget_id', budgets.map(b => b.id));
    
    if (itemsError) {
      throw new Error(`Error fetching budget items: ${itemsError.message}`);
    }
    
    // Recalculate spent amount for each budget item
    for (const item of budgetItems) {
      const { error: updateError } = await supabase.rpc('update_budget_item_spent', {
        p_budget_item_id: item.id
      });
      
      if (updateError) {
        console.error(`Error updating spent amount for item ${item.id}:`, updateError);
      }
    }
    
    console.log("All spent amounts recalculated successfully");
    return true;
  } catch (error: any) {
    console.error("Error recalculating spent amounts:", error);
    throw error;
  }
};

export const getExpensesByItem = async (budgetItemId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('budget_item_id', budgetItemId);
  
  if (error) {
    throw new Error(`Failed to get expenses: ${error.message}`);
  }
  
  return data;
};

export const getExpensesBySubItem = async (subItemId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('sub_item_id', subItemId);
  
  if (error) {
    throw new Error(`Failed to get sub-item expenses: ${error.message}`);
  }
  
  return data;
};
