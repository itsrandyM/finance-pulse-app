
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BudgetItem } from '@/contexts/BudgetContext';

interface ExpenseInputCardProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number) => void;
}

const ExpenseInputCard: React.FC<ExpenseInputCardProps> = ({
  budgetItems,
  onAddExpense,
}) => {
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      toast({
        title: "No Category Selected",
        description: "Please select a budget category.",
        variant: "destructive"
      });
      return;
    }
    
    const numericAmount = parseFloat(expenseAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive"
      });
      return;
    }
    
    onAddExpense(selectedItemId, numericAmount);
    setExpenseAmount('');
    
    toast({
      title: "Expense Added",
      description: `$${numericAmount.toFixed(2)} expense recorded.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Budget Category</Label>
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
              >
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Expense Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="expense-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-8"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
            disabled={!selectedItemId || !expenseAmount}
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseInputCard;
