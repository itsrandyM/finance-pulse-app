
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBudget, BudgetPeriod } from '@/contexts/BudgetContext';

const periods: { value: BudgetPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' },
  { value: 'custom', label: 'Custom' },
];

const BudgetPeriodSelect: React.FC = () => {
  const { setPeriod } = useBudget();
  const navigate = useNavigate();

  const handlePeriodSelect = (period: BudgetPeriod) => {
    setPeriod(period);
    navigate('/budget-amount');
  };

  return (
    <Card className="w-full max-w-lg mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-finance-text">Choose Budget Period</CardTitle>
        <CardDescription className="text-center">
          Select how often you want to budget your finances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant="outline"
              className="h-16 text-lg hover:bg-finance-primary hover:text-white"
              onClick={() => handlePeriodSelect(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetPeriodSelect;
