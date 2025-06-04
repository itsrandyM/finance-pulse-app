
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface BudgetItemFormProps {
  onAddItem: (name: string, amount: number) => void;
  totalBudget: number;
  totalAllocated: number;
}

const BudgetItemForm: React.FC<BudgetItemFormProps> = ({ 
  onAddItem, 
  totalBudget, 
  totalAllocated 
}) => {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    
    if (totalAllocated + numericAmount > totalBudget) {
      toast({
        title: "Budget Exceeded",
        description: "This item would exceed your total budget.",
        variant: "destructive"
      });
      return;
    }
    
    onAddItem(name, numericAmount);
    setName('');
    setAmount('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Add Budget Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="e.g., Rent, Transport, Food"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="item-amount"
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
          <Button type="submit" className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary rounded-none">
            Add Budget Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BudgetItemForm;
