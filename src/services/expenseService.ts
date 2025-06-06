
import { supabase } from '@/integrations/supabase/client';

export const addExpense = async (
  budgetItemId: string,
  amount: number,
  subItemIds?: string[]
) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  try {
    console.log("=== EXPENSE SERVICE START ===");
    console.log("Adding expense to database:", { budgetItemId, amount, subItemIds });
    
    // If subItemIds are provided, add expenses for each sub-item
    if (subItemIds && subItemIds.length > 0) {
      console.log("Adding expenses for sub-items:", subItemIds);
      for (const subItemId of subItemIds) {
        const { error } = await supabase
          .from('expenses')
          .insert({
            budget_item_id: budgetItemId,
            sub_item_id: subItemId,
            amount: amount / subItemIds.length, // Divide the amount equally
            user_id: userId
          });
        
        if (error) {
          console.error("Error adding sub-item expense:", error);
          throw new Error(`Error adding sub-item expense: ${error.message}`);
        }
      }
    }
    // Otherwise, add expense for the budget item directly
    else {
      console.log("Adding expense for budget item directly");
      const { error } = await supabase
        .from('expenses')
        .insert({
          budget_item_id: budgetItemId,
          amount,
          user_id: userId
        });
      
      if (error) {
        console.error("Error adding expense:", error);
        throw new Error(`Error adding expense: ${error.message}`);
      }
    }
    
    console.log("Expense inserted successfully, now updating spent amount...");
    
    // Update the spent amount for the budget item using the database function
    const { error: updateError } = await supabase.rpc('update_budget_item_spent', {
      budget_item_id: budgetItemId
    });
    
    if (updateError) {
      console.error("Error updating spent amount:", updateError);
      throw new Error(`Error updating spent amount: ${updateError.message}`);
    }
    
    console.log("Spent amount updated via database function");
    
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
    
    return { success: true, newSpent: parseFloat(updatedItem.spent) || 0 };
  } catch (error: any) {
    console.error("=== EXPENSE SERVICE ERROR ===", error);
    throw new Error(`Failed to add expense: ${error.message}`);
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
