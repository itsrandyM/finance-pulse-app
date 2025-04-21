
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BudgetPeriodSelect from '@/components/BudgetPeriodSelect';
import { useBudget, BudgetPeriod } from '@/contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';

const BudgetPeriodSelectPage = () => {
  const navigate = useNavigate();
  const { 
    setPeriod, 
    period, 
    currentBudgetId, 
    budgetDateRange, 
    isBudgetExpired,
    createNewBudgetPeriod
  } = useBudget();
  const [isCreatingNewBudget, setIsCreatingNewBudget] = useState(false);

  useEffect(() => {
    if (period && currentBudgetId && !isBudgetExpired) {
      navigate('/budget');
    }
  }, [period, currentBudgetId, isBudgetExpired, navigate]);

  const handlePeriodSelected = (selectedPeriod: string) => {
    setPeriod(selectedPeriod as BudgetPeriod);
    navigate('/budget-amount');
  };

  const handleCreateNewBudget = async () => {
    setIsCreatingNewBudget(true);
    try {
      await createNewBudgetPeriod();
      navigate('/budget');
    } finally {
      setIsCreatingNewBudget(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Budget Setup</h1>
      
      {/* Show expired budget warning if applicable */}
      {isBudgetExpired && budgetDateRange && (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-800">Budget Period Expired</CardTitle>
            <CardDescription className="text-yellow-700">
              Your {period} budget has ended. It was active from {' '}
              {format(budgetDateRange.startDate, 'MMMM dd, yyyy')} to {' '}
              {format(budgetDateRange.endDate, 'MMMM dd, yyyy')}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Would you like to create a new budget with the same period type?
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateNewBudget} 
              disabled={isCreatingNewBudget}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Create New {period && period.charAt(0).toUpperCase() + period.slice(1)} Budget
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Select Budget Period</CardTitle>
          <CardDescription>
            Choose how long your budget will last. This will help track spending over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetPeriodSelect onPeriodSelected={handlePeriodSelected} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPeriodSelectPage;
