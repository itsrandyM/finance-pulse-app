
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { useBudgetAlerts } from '@/hooks/useBudgetAlerts';
import VisualSummaryCard from './budget/VisualSummaryCard';
import SimpleBudgetSummary from './tracking/SimpleBudgetSummary';
import QuickExpenseInput from './tracking/QuickExpenseInput';
import SimpleSpendingProgress from './tracking/SimpleSpendingProgress';
import BudgetAlertsDisplay from './budget/BudgetAlertsDisplay';
import SimpleAnalyticsDashboard from './analytics/SimpleAnalyticsDashboard';
import * as incomeService from '@/services/incomeService';

const ExpenseTracking: React.FC = () => {
  const { 
    budgetItems, 
    totalBudget, 
    addExpense,
    addSubItem,
    getTotalSpent,
    getRemainingBudget,
    loadBudget,
    isLoading
  } = useBudget();
  
  const { toast } = useToast();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);

  // Fetch total income
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const income = await incomeService.getTotalIncome();
        setTotalIncome(income);
      } catch (error) {
        console.error("Failed to fetch total income:", error);
      }
    };
    fetchIncome();
  }, []);

  const budgetAlerts = useBudgetAlerts({
    budgetItems,
    totalBudget,
    getTotalSpent,
    getRemainingBudget,
    totalIncome,
  });

  // Load budget data when component mounts (only once)
  useEffect(() => {
    if (!hasLoadedInitial) {
      const loadData = async () => {
        try {
          await loadBudget();
          setHasLoadedInitial(true);
        } catch (error) {
          console.error("Failed to load budget:", error);
        }
      };
      
      loadData();
    }
  }, [loadBudget, hasLoadedInitial]);

  const handleAddExpense = async (itemId: string, amount: number, subItemIds?: string[]) => {
    try {
      setIsAddingExpense(true);
      console.log('Adding expense:', { itemId, amount, subItemIds });
      
      await addExpense(itemId, amount, subItemIds);
      
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive"
      });
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleAddSubItem = async (budgetItemId: string, name: string, amount: number) => {
    if (addSubItem) {
      return await addSubItem(budgetItemId, name, amount);
    }
    return Promise.reject(new Error("Add sub-item function is not available."));
  };

  if (isLoading && !hasLoadedInitial) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-finance-primary mx-auto mb-4"></div>
          <p>Loading budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SimpleBudgetSummary
        totalBudget={totalBudget}
        totalSpent={getTotalSpent()}
        remainingBudget={getRemainingBudget()}
        formatCurrency={formatCurrency}
      />

      <Tabs defaultValue="expense-entry" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense-entry">Add Expense</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expense-entry" className="space-y-6">
          <QuickExpenseInput
            budgetItems={budgetItems}
            onAddExpense={handleAddExpense}
            isLoading={isAddingExpense}
            onAddSubItem={handleAddSubItem}
          />

          {/* Budget Alerts moved here - below the quick expense entry card */}
          {budgetAlerts.hasAlerts && (
            <BudgetAlertsDisplay
              alerts={budgetAlerts.alerts}
              onDismissAlert={budgetAlerts.dismissAlert}
            />
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <SimpleSpendingProgress
            budgetItems={budgetItems}
            formatCurrency={formatCurrency}
          />

          <VisualSummaryCard 
            budgetItems={budgetItems} 
            formatCurrency={formatCurrency} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SimpleAnalyticsDashboard
            budgetItems={budgetItems}
            totalBudget={totalBudget}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseTracking;

