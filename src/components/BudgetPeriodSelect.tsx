import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BudgetPeriodSelectProps {
  onPeriodSelected: (period: string) => void;
}

const BudgetPeriodSelect: React.FC<BudgetPeriodSelectProps> = ({ onPeriodSelected }) => {
  const [period, setPeriod] = React.useState<string>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPeriodSelected(period);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-finance-text">Select Budget Period</CardTitle>
          <CardDescription>Choose the period for your budget.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <RadioGroup defaultValue="monthly" className="flex flex-col space-y-1" onValueChange={setPeriod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="r1" />
                  <label htmlFor="r1" className="cursor-pointer">Daily</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="r2" />
                  <label htmlFor="r2" className="cursor-pointer">Weekly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bi-weekly" id="r3" />
                  <label htmlFor="r3" className="cursor-pointer">Bi-Weekly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="r4" />
                  <label htmlFor="r4" className="cursor-pointer">Monthly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="r5" />
                  <label htmlFor="r5" className="cursor-pointer">Quarterly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semi-annually" id="r6" />
                  <label htmlFor="r6" className="cursor-pointer">Semi-Annually</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annually" id="r7" />
                  <label htmlFor="r7" className="cursor-pointer">Annually</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="r8" />
                  <label htmlFor="r8" className="cursor-pointer">Custom</label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full bg-finance-primary hover:bg-finance-secondary">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPeriodSelect;
