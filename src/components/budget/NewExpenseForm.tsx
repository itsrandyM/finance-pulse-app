
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NewExpenseFormProps {
  onAddNewExpense: (name: string, amount: number) => void;
}

const NewExpenseForm: React.FC<NewExpenseFormProps> = ({ onAddNewExpense }) => {
  const [newItemName, setNewItemName] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!newItemName || !expenseAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter both name and amount for the new expense.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive"
      });
      return;
    }

    onAddNewExpense(newItemName, amount);
    setNewItemName('');
    setExpenseAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-item-name">Expense Name</Label>
        <Input
          id="new-item-name"
          placeholder="Enter expense name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-item-amount">Amount</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">$</span>
          </div>
          <Input
            id="new-item-amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            className="pl-8"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />
        </div>
      </div>
      <Button 
        type="button"
        onClick={handleSubmit}
        className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
      >
        Add New Expense
      </Button>
    </div>
  );
};

export default NewExpenseForm;
