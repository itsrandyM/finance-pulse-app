
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';

interface QuickExpenseInputProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number, subItemIds?: string[]) => Promise<void>;
  isLoading: boolean;
}

const QuickExpenseInput: React.FC<QuickExpenseInputProps> = ({
  budgetItems,
  onAddExpense,
  isLoading
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedSubItems, setSelectedSubItems] = useState<string[]>([]);

  // Common expense presets
  const quickAmounts = [5, 10, 25, 50, 100];

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await onAddExpense(
      selectedItemId, 
      numAmount, 
      selectedSubItems.length > 0 ? selectedSubItems : undefined
    );
    
    setAmount('');
    setSelectedSubItems([]);
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
        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium block">Budget Item</label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a budget item" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                {budgetItems.map(item => {
                  const remaining = item.amount - item.spent;
                  const isOverBudget = remaining < 0;
                  
                  return (
                    <SelectItem key={item.id} value={item.id} className="cursor-pointer">
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate flex-1 mr-2">{item.name}</span>
                        <span className={`text-xs flex-shrink-0 ${isOverBudget ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {isOverBudget ? 'Over budget' : `${formatCurrency(remaining)} left`}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-items selection */}
          {selectedItem && selectedItem.subItems.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium block">Sub-items (optional)</label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                {selectedItem.subItems.map(subItem => (
                  <Badge
                    key={subItem.id}
                    variant={selectedSubItems.includes(subItem.id) ? "default" : "outline"}
                    className="cursor-pointer text-xs px-2 py-1 truncate max-w-full"
                    onClick={() => {
                      setSelectedSubItems(prev =>
                        prev.includes(subItem.id)
                          ? prev.filter(id => id !== subItem.id)
                          : [...prev, subItem.id]
                      );
                    }}
                  >
                    <span className="truncate">{subItem.name}</span>
                    <span className="ml-1 flex-shrink-0">({formatCurrency(subItem.amount)})</span>
                  </Badge>
                ))}
              </div>
            </div>
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
              
              {/* Quick amount buttons */}
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Quick amounts:</div>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map(quickAmount => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(quickAmount)}
                      disabled={isLoading}
                      className="text-xs px-3 py-1 h-8 flex-shrink-0"
                    >
                      {formatCurrency(quickAmount)}
                    </Button>
                  ))}
                </div>
              </div>
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
