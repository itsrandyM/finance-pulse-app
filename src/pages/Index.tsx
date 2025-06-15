
import { useEffect, useState } from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { useAuth } from '@/contexts/AuthContext';
import SetupPage from './SetupPage';
import ExpiredBudgetOverlay from '@/components/budget/ExpiredBudgetOverlay';
import { CreateNewBudgetDialog } from '@/components/budget/CreateNewBudgetDialog';
import { AddIncomeToBudgetDialog } from '@/components/budget/AddIncomeToBudgetDialog';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BudgetPeriodCard from '@/components/dashboard/BudgetPeriodCard';
import BudgetOverviewCards from '@/components/dashboard/BudgetOverviewCards';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import BudgetCategoriesCard from '@/components/dashboard/BudgetCategoriesCard';

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    period, 
    totalBudget, 
    budgetItems, 
    getTotalSpent, 
    getRemainingBudget, 
    isLoading: budgetLoading,
    budgetDateRange,
    isBudgetExpired
  } = useBudget();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);

  // Show setup page if user doesn't have a budget configured
  const hasExistingBudget = period && totalBudget > 0;
  
  // Debug logging for expired budget
  useEffect(() => {
    console.log('Index page - Budget expiration status:', {
      isBudgetExpired,
      budgetDateRange,
      hasExistingBudget
    });
  }, [isBudgetExpired, budgetDateRange, hasExistingBudget]);
  
  if (authLoading || budgetLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-finance-primary"></div>
      </div>
    );
  }

  if (!hasExistingBudget) {
    return <SetupPage />;
  }

  const totalSpent = getTotalSpent();
  const remainingBudget = getRemainingBudget();
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <>
      {/* Expired Budget Overlay - should show when budget is expired */}
      {isBudgetExpired && <ExpiredBudgetOverlay />}
      
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <DashboardHeader />

        {/* Budget Period Information */}
        {budgetDateRange && (
          <BudgetPeriodCard
            period={period!}
            budgetDateRange={budgetDateRange}
            onShowIncomeDialog={() => setShowIncomeDialog(true)}
            onShowCreateDialog={() => setShowCreateDialog(true)}
          />
        )}

        {/* Budget Overview Cards */}
        <BudgetOverviewCards
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          remainingBudget={remainingBudget}
          spentPercentage={spentPercentage}
          period={period!}
        />

        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Budget Categories Summary */}
        <BudgetCategoriesCard budgetItems={budgetItems} />
      </div>

      <CreateNewBudgetDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
      
      <AddIncomeToBudgetDialog 
        open={showIncomeDialog} 
        onOpenChange={setShowIncomeDialog}
      />
    </>
  );
};

export default Index;
