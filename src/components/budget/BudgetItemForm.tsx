
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';

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
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Plus className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Add Budget Item</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium text-gray-700">
              Item Name
            </Label>
            <Input
              id="item-name"
              placeholder="e.g., Rent, Transport, Food"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-amount" className="text-sm font-medium text-gray-700">
              Amount
            </Label>
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
                className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget Item
        </Button>
      </form>
    </div>
  );
};

export default BudgetItemForm;
