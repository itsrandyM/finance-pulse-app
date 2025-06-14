
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import { useAuth } from '@/contexts/AuthContext';
import SetupPage from './SetupPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, DollarSign, ArrowRight, Calendar, Plus } from 'lucide-react';
import { CreateNewBudgetDialog } from '@/components/budget/CreateNewBudgetDialog';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    period, 
    totalBudget, 
    budgetItems, 
    getTotalSpent, 
    getRemainingBudget, 
    isLoading: budgetLoading,
    budgetDateRange 
  } = useBudget();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Show setup page if user doesn't have a budget configured
  const hasExistingBudget = period && totalBudget > 0;
  
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome back! Here's your budget overview
        </p>
      </div>

      {/* Budget Period Information */}
      {budgetDateRange && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-900 capitalize">
                  Current {period} Budget Period
                </CardTitle>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create New Budget
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-blue-700">
              <span><strong>Start:</strong> {formatDate(budgetDateRange.startDate)}</span>
              <span className="hidden sm:inline">•</span>
              <span><strong>End:</strong> {formatDate(budgetDateRange.endDate)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground capitalize">
              {period} budget period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {spentPercentage.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${remainingBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget < 0 ? 'Over budget' : 'Available to spend'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your budget and track expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/tracking')}>
            Track Expense
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button onClick={() => navigate('/budget')} variant="outline">
            View Budget
          </Button>
          <Button onClick={() => navigate('/expense-history')} variant="outline">
            Expense History
          </Button>
          <Button onClick={() => navigate('/income-setup')} variant="outline">
            Manage Income
          </Button>
        </CardContent>
      </Card>

      {/* Budget Categories Summary */}
      {budgetItems && budgetItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>
              Your {budgetItems.length} budget categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetItems.slice(0, 6).map((item) => {
                const itemSpentPercentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
                return (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      ${item.spent.toLocaleString()} / ${item.amount.toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          itemSpentPercentage > 100 ? 'bg-red-500' : 
                          itemSpentPercentage > 80 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(itemSpentPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {budgetItems.length > 6 && (
              <div className="mt-4 text-center">
                <Button onClick={() => navigate('/budget')} variant="outline" size="sm">
                  View All Categories
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <CreateNewBudgetDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default Index;
