import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileText, Tag } from 'lucide-react';
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
    // Reset form but keep the form open
    setName('');
    setAmount('');
  };

  // Helper function to get tag color class
  const getTagColor = (tag: string | null | undefined) => {
    const colorMap: Record<string, string> = {
      Bills: 'bg-orange-200 text-orange-800',
      Savings: 'bg-green-200 text-green-800',
      Groceries: 'bg-blue-200 text-blue-800',
      Transport: 'bg-sky-200 text-sky-800',
      Shopping: 'bg-pink-200 text-pink-800',
      Dining: 'bg-purple-200 text-purple-800',
    }
    if (!tag) return 'bg-gray-100 text-gray-500';
    return colorMap[tag] || 'bg-gray-200 text-gray-700';
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
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span>{subItem.name}</span>
                  {subItem.tag && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTagColor(subItem.tag)}`}>
                      <Tag className="inline h-3 w-3 mb-0.5 mr-1" />
                      {subItem.tag}
                    </span>
                  )}
                </div>
                {subItem.note && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="inline h-3 w-3 mb-0.5" /> {subItem.note}
                  </div>
                )}
              </div>
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
