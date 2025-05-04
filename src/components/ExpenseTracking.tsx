
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBudget } from '@/contexts/BudgetContext';
import { DollarSign } from 'lucide-react';
import BudgetSummaryCard from './budget/BudgetSummaryCard';
import ExpenseInputCard from './budget/ExpenseInputCard';
import SpendingProgressCard from './budget/SpendingProgressCard';
import VisualSummaryCard from './budget/VisualSummaryCard';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { LoadingSection } from './ui/loading-spinner';
import ExpiredBudgetOverlay from './budget/ExpiredBudgetOverlay';

const ExpenseTracking: React.FC = () => {
  // Wrap the component content in a try-catch to handle context errors gracefully
  try {
    const { 
      budgetItems, 
      totalBudget, 
      addExpense, 
      getTotalSpent,
      getRemainingBudget,
      loadBudget,
      isBudgetExpired,
      isLoading: contextLoading
    } = useBudget();
    
    const [localLoading, setLocalLoading] = useState(true);
    const [loadingExpense, setLoadingExpense] = useState(false);
    const { toast } = useToast();
    
    // Ensure we have the latest budget data when the component mounts
    useEffect(() => {
      console.log("Loading budget data in ExpenseTracking...");
      
      let mounted = true;
      let loadingTimeout: NodeJS.Timeout;
      
      const loadData = async () => {
        if (!mounted) return;
        
        try {
          await loadBudget();
        } catch (error) {
          console.error("Failed to load budget data:", error);
        } finally {
          if (mounted) {
            // Add a small delay to prevent flickering
            loadingTimeout = setTimeout(() => {
              setLocalLoading(false);
            }, 500);
          }
        }
      };
      
      loadData();
      
      return () => {
        mounted = false;
        if (loadingTimeout) clearTimeout(loadingTimeout);
      };
    }, [loadBudget]);

    // Function to handle expense addition
    const handleAddExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
      try {
        console.log("Adding expense in ExpenseTracking:", { itemId, amount, subItemIds });
        setLoadingExpense(true);
        
        // Add the expense
        await addExpense(itemId, amount, subItemIds);
        
        // Reload the budget data to get updated spent amounts
        console.log("Reloading budget after adding expense");
        await loadBudget();
        
        toast({
          title: "Expense Added",
          description: `Expense of ${formatCurrency(amount)} has been added successfully.`,
        });
        
        console.log("Expense added successfully");
      } catch (error: any) {
        console.error("Error adding expense:", error);
        toast({
          title: "Error adding expense",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoadingExpense(false);
      }
    };

    // Combined loading state
    const isPageLoading = localLoading || contextLoading;

    // Display loading state only on initial load, not during every operation
    if (isPageLoading) {
      return (
        <LoadingSection 
          variant="spinner" 
          size="lg" 
          theme="finance" 
          text="Loading your budget..."
          className="min-h-[300px]" 
        />
      );
    }

    return (
      <>
        {/* Show expired budget overlay if budget is expired */}
        {isBudgetExpired && <ExpiredBudgetOverlay />}
        
        <div className={`space-y-6 animate-fade-in ${isBudgetExpired ? 'opacity-50 pointer-events-none' : ''}`}>
          <BudgetSummaryCard
            totalBudget={totalBudget}
            totalSpent={getTotalSpent()}
            remainingBudget={getRemainingBudget()}
            budgetItems={budgetItems}
            formatCurrency={formatCurrency}
            isRefreshing={loadingExpense}
          />

          <ExpenseInputCard
            budgetItems={budgetItems}
            onAddExpense={handleAddExpense}
            isRefreshing={loadingExpense}
          />

          {budgetItems.length > 0 ? (
            <SpendingProgressCard
              budgetItems={budgetItems}
              formatCurrency={formatCurrency}
              isRefreshing={loadingExpense}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-500">No Budget Items</h3>
                  <p className="text-sm text-gray-400">
                    You need to create budget items before you can track expenses.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {budgetItems.length > 0 && (
            <VisualSummaryCard budgetItems={budgetItems} formatCurrency={formatCurrency} />
          )}
        </div>
        
        {/* Transparent overlay during expense operations */}
        {loadingExpense && (
          <div className="fixed inset-0 bg-background/30 backdrop-blur-sm z-40 flex items-center justify-center">
            <LoadingSection 
              variant="spinner" 
              size="md" 
              theme="finance" 
              text="Processing expense..."
            />
          </div>
        )}
      </>
    );
  } catch (error) {
    // Fallback UI when BudgetProvider is not available
    console.error("ExpenseTracking error:", error);
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-800">
        <h2 className="text-lg font-semibold mb-2">Budget Context Error</h2>
        <p>Unable to load expense tracking. Please ensure you're logged in and have a budget created.</p>
      </div>
    );
  }
};

export default ExpenseTracking;
