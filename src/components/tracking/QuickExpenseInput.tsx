
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import BudgetItemSelector from './BudgetItemSelector';
import SubItemsSelector from './SubItemsSelector';
import QuickAmountButtons from './QuickAmountButtons';

interface QuickExpenseInputProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number, subItemId?: string) => Promise<void>;
  isLoading: boolean;
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => Promise<any>;
}

const QuickExpenseInput: React.FC<QuickExpenseInputProps> = ({
  budgetItems,
  onAddExpense,
  isLoading,
  onAddSubItem
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedSubItemId, setSelectedSubItemId] = useState<string | null>(null);

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setSelectedSubItemId(null);
    setAmount('');
  };

  const handleSelectSubItem = (subItemId: string, subItemAmount: number) => {
    setSelectedSubItemId(subItemId);
    setAmount(subItemAmount.toString());
  };
  
  const handleDeselectSubItem = () => {
    setSelectedSubItemId(null);
    setAmount('');
  };

  const handleAddSubItemForSelectedItem = (name: string, amount: number) => {
    if (!selectedItemId) {
      return Promise.reject(new Error("Cannot add sub-item without a selected budget item."));
    }
    return onAddSubItem(selectedItemId, name, amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await onAddExpense(
      selectedItemId, 
      numAmount, 
      selectedSubItemId || undefined
    );
    
    setAmount('');
    setSelectedSubItemId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-finance-primary flex-shrink-0" />
          <span className="truncate">Quick Expense Entry</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <BudgetItemSelector
            budgetItems={budgetItems}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
          />

          {selectedItem && (
            <SubItemsSelector
              selectedItem={selectedItem}
              selectedSubItemId={selectedSubItemId}
              onSelectSubItem={handleSelectSubItem}
              onDeselectSubItem={handleDeselectSubItem}
              onAddSubItem={handleAddSubItemForSelectedItem}
            />
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium block">Amount</label>
            <div className="space-y-3">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg w-full"
              />
              
              <QuickAmountButtons
                onSelectAmount={handleQuickAmount}
                isLoading={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-10" 
            disabled={!selectedItemId || !amount || isLoading}
          >
            <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{isLoading ? 'Adding...' : 'Add Expense'}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickExpenseInput;
