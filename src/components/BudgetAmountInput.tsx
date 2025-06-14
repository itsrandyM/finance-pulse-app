import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import * as incomeService from '@/services/incomeService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BudgetAmountInputProps {
  onSubmit: (amount: number) => Promise<void>;
}

const BudgetAmountInput: React.FC<BudgetAmountInputProps> = ({ onSubmit }) => {
  const { period, previousRemainingBudget } = useBudget();
  const [amount, setAmount] = useState<string>('');
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [budgetAmountToConfirm, setBudgetAmountToConfirm] = useState<number | null>(null);
  const navigate = useNavigate();

  // Load total income on component mount
  useEffect(() => {
    const loadIncome = async () => {
      setIsLoading(true);
      try {
        const incomeEntries = await incomeService.getIncomeEntries();
        const total = incomeEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
        setTotalIncome(total);
        
        // Pre-fill the amount with income + previous remaining budget
        const totalAvailable = total + previousRemainingBudget;
        if (totalAvailable > 0 && !amount) {
          setAmount(totalAvailable.toString());
        }
      } catch (error) {
        console.error("Failed to load income:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIncome();
  }, [previousRemainingBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    
    const totalAvailable = totalIncome + previousRemainingBudget;

    if (numericAmount > totalAvailable && totalAvailable > 0) {
      setBudgetAmountToConfirm(numericAmount);
      setIsConfirming(true);
    } else {
      await onSubmit(numericAmount);
    }
  };

  const handleConfirm = async () => {
    if (budgetAmountToConfirm) {
      await onSubmit(budgetAmountToConfirm);
    }
    setIsConfirming(false);
    setBudgetAmountToConfirm(null);
  };

  const handleBack = () => {
    navigate('/income-setup');
  };

  const periodText = period ? 
    period.charAt(0).toUpperCase() + period.slice(1) : 
    'Selected';

  const totalAvailable = totalIncome + previousRemainingBudget;

  return (
    <>
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-fit mb-2 p-0" 
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <CardTitle className="text-2xl text-center text-finance-text">
              Set {periodText} Budget
            </CardTitle>
            <CardDescription className="text-center">
              Enter the total amount you want to budget for this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner variant="wave" size="md" theme="primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {totalIncome > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="font-medium">Income Available</p>
                    <p className="text-lg font-semibold text-finance-primary">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                )}
                
                {previousRemainingBudget > 0 && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="font-medium">Previous Budget Remaining</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(previousRemainingBudget)}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      This amount will be added to your new budget
                    </p>
                  </div>
                )}

                {totalAvailable > 0 && (
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="font-medium text-gray-700">Total Available</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalAvailable)}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">Ksh</span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="pl-12"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  
                  {parseFloat(amount) > totalAvailable && totalAvailable > 0 && (
                    <div className="text-xs text-finance-accent mt-1">
                      Adding {formatCurrency(parseFloat(amount) - totalAvailable)} to your available funds
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-finance-primary hover:bg-finance-secondary"
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            >
              Continue to Budget Allocation
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Your planned budget of{' '}
              <span className="font-semibold">{formatCurrency(budgetAmountToConfirm || 0)}</span> is
              higher than your available funds of{' '}
              <span className="font-semibold">{formatCurrency(totalAvailable)}</span>.
              <br /><br />
              You are planning to source an additional{' '}
              <span className="font-semibold text-finance-accent">
                {formatCurrency((budgetAmountToConfirm || 0) - totalAvailable)}
              </span>{' '}
              for this budget period. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBudgetAmountToConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Yes, Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BudgetAmountInput;
