
import React, { useState } from 'react';
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

const BudgetAmountInput: React.FC = () => {
  const { period, setTotalBudget } = useBudget();
  const [amount, setAmount] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    
    setTotalBudget(numericAmount);
    navigate('/budget');
  };

  const handleBack = () => {
    navigate('/');
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
          <div className="space-y-4">
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
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-finance-primary hover:bg-finance-secondary"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Continue to Budget Allocation
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BudgetAmountInput;
