
import React from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';

interface ExpiredBudgetOverlayProps {
  className?: string;
}

const ExpiredBudgetOverlay: React.FC<ExpiredBudgetOverlayProps> = ({ className = '' }) => {
  const { 
    isBudgetExpired, 
    period, 
    budgetDateRange,
    createNewBudgetPeriod,
    getRemainingBudget,
    previousRemainingBudget
  } = useBudget();
  const [isCreatingNewBudget, setIsCreatingNewBudget] = React.useState(false);
  const navigate = useNavigate();
  
  if (!isBudgetExpired || !budgetDateRange) {
    return null;
  }
  
  const handleCreateNewBudget = async () => {
    setIsCreatingNewBudget(true);
    try {
      await createNewBudgetPeriod();
      navigate('/income-setup');
    } finally {
      setIsCreatingNewBudget(false);
    }
  };
  
  const remainingBudget = getRemainingBudget();
  const carryOverAmount = remainingBudget > 0 ? remainingBudget : 0;
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className="w-full max-w-lg bg-white shadow-lg">
        <CardHeader className="bg-yellow-50 border-b border-yellow-200">
          <CardTitle className="flex items-center text-xl text-yellow-800">
            <AlertCircle className="mr-2 h-5 w-5" />
            Budget Period Expired
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Your {period} budget has ended. It was active from {' '}
            {format(budgetDateRange.startDate, 'MMMM dd, yyyy')} to {' '}
            {format(budgetDateRange.endDate, 'MMMM dd, yyyy')}.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">Remaining Budget</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(carryOverAmount)}</p>
              <p className="text-xs text-blue-700 mt-1">
                This amount will be carried over to your new budget.
              </p>
            </div>
            
            <div className="text-gray-700">
              <h3 className="font-medium">What happens next?</h3>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                <li>Your continuous budget items will be transferred to the new budget</li>
                <li>Your remaining budget amount will be added to your new budget</li>
                <li>You'll be able to add new income sources</li>
              </ul>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleCreateNewBudget}
            disabled={isCreatingNewBudget}
            className="w-full bg-finance-primary hover:bg-finance-secondary"
          >
            {isCreatingNewBudget ? (
              <LoadingSpinner variant="spinner" size="sm" theme="light" />
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Create New {period} Budget
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isCreatingNewBudget}
            className="w-full"
          >
            Go to Budget Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExpiredBudgetOverlay;
