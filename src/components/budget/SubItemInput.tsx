
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { SubBudgetItem } from '@/contexts/BudgetContext';

interface SubItemInputProps {
  budgetItemId: string;
  subItems: SubBudgetItem[];
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => void;
  onDeleteSubItem: (budgetItemId: string, subItemId: string) => void;
  budgetItemAmount: number;
}

const SubItemInput: React.FC<SubItemInputProps> = ({
  budgetItemId,
  subItems,
  onAddSubItem,
  onDeleteSubItem,
  budgetItemAmount,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const totalSubItemsAmount = subItems.reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = budgetItemAmount - totalSubItemsAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (numericAmount > remainingAmount) {
      return; // Don't add if it exceeds the budget item amount
    }

    onAddSubItem(budgetItemId, name, numericAmount);
    setName('');
    setAmount('');
  };

  return (
    <div className="space-y-4 pl-6 mt-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="space-y-2 flex-1">
          <Label htmlFor="sub-item-name">Item Name</Label>
          <Input
            id="sub-item-name"
            placeholder="e.g., Milk, Phone"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 w-32">
          <Label htmlFor="sub-item-amount">Amount</Label>
          <Input
            id="sub-item-amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            max={remainingAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <Button 
          type="submit" 
          size="icon" 
          variant="outline"
          className="mb-0.5"
          disabled={!name || !amount || parseFloat(amount) > remainingAmount}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {subItems.length > 0 && (
        <div className="space-y-2">
          {subItems.map((subItem) => (
            <div key={subItem.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{subItem.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">${subItem.amount.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSubItem(budgetItemId, subItem.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="text-sm text-gray-600 flex justify-between pt-2">
            <span>Remaining:</span>
            <span>${remainingAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubItemInput;
