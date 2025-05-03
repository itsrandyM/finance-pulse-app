
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

interface BudgetAmountInputProps {
  onSubmit: (amount: number) => Promise<void>;
}

const BudgetAmountInput: React.FC<BudgetAmountInputProps> = ({ onSubmit }) => {
  const { period } = useBudget();
  const [amount, setAmount] = useState<string>('');
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load total income on component mount
  useEffect(() => {
    const loadIncome = async () => {
      setIsLoading(true);
      try {
        const incomeEntries = await incomeService.getIncomeEntries();
        const total = incomeEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
        setTotalIncome(total);
        
        // Pre-fill the amount with income
        if (total > 0 && !amount) {
          setAmount(total.toString());
        }
      } catch (error) {
        console.error("Failed to load income:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIncome();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    
    await onSubmit(numericAmount);
  };

  const handleBack = () => {
    navigate('/income-setup');
  };

  const periodText = period ? 
    period.charAt(0).toUpperCase() + period.slice(1) : 
    'Selected';

  return (
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
                  <p className="text-sm text-gray-500 mt-1">
                    You can budget this amount or add additional funds
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                
                {parseFloat(amount) > totalIncome && totalIncome > 0 && (
                  <div className="text-xs text-finance-accent mt-1">
                    Adding {formatCurrency(parseFloat(amount) - totalIncome)} to your income
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
  );
};

export default BudgetAmountInput;
