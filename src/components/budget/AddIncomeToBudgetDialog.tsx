
import React, { useState } from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Plus, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as incomeService from '@/services/incomeService';

interface AddIncomeToBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddIncomeToBudgetDialog: React.FC<AddIncomeToBudgetDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { totalBudget, setTotalBudget, budgetDateRange } = useBudget();
  const { toast } = useToast();
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddIncome = async () => {
    if (!incomeName.trim() || !incomeAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter both income name and amount.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(incomeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAdding(true);
      
      // Use the current budget's start date as the budget period
      const budgetPeriodStart = budgetDateRange?.startDate 
        ? new Date(budgetDateRange.startDate).toISOString()
        : new Date().toISOString();
      
      // Add income to the database with current budget period
      await incomeService.createIncomeEntry(incomeName.trim(), amount, budgetPeriodStart);
      
      // Add the income amount to the current budget
      setTotalBudget(totalBudget + amount);
      
      toast({
        title: "Income Added Successfully",
        description: `${formatCurrency(amount)} has been added to your current budget.`,
      });

      // Reset form and close dialog
      setIncomeName('');
      setIncomeAmount('');
      onOpenChange(false);
      
    } catch (error: any) {
      toast({
        title: "Error Adding Income",
        description: error.message || "Failed to add income to budget.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-500" />
            Add Income to Current Budget
          </DialogTitle>
          <DialogDescription>
            Add unexpected income or additional funds to your current budget period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This income will be tagged to your current budget period and added to your available funds.
            </AlertDescription>
          </Alert>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current Budget Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(totalBudget)}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income-name">Income Source</Label>
              <Input
                id="income-name"
                type="text"
                placeholder="e.g., Freelance payment, Bonus, Gift"
                value={incomeName}
                onChange={(e) => setIncomeName(e.target.value)}
                disabled={isAdding}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Ksh
                </span>
                <Input
                  id="income-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="pl-12"
                  disabled={isAdding}
                />
              </div>
            </div>

            {incomeAmount && !isNaN(parseFloat(incomeAmount)) && parseFloat(incomeAmount) > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-3">
                  <div className="text-sm text-blue-700">
                    <strong>New Budget Total:</strong> {formatCurrency(totalBudget + parseFloat(incomeAmount))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleAddIncome} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Income'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
