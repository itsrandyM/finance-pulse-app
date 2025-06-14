
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, Coffee, Car, ShoppingCart, Home, Utensils } from 'lucide-react';
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
  
  // Category-based quick expenses
  const quickExpenseCategories = [
    { icon: Coffee, label: 'Coffee', amount: 5, category: 'food' },
    { icon: Utensils, label: 'Lunch', amount: 15, category: 'food' },
    { icon: Car, label: 'Gas', amount: 50, category: 'transport' },
    { icon: ShoppingCart, label: 'Groceries', amount: 100, category: 'food' },
    { icon: Home, label: 'Utilities', amount: 75, category: 'bills' },
  ];

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleQuickExpense = async (quickExpense: typeof quickExpenseCategories[0]) => {
    // Try to find a matching budget item
    const matchingItem = budgetItems.find(item => 
      item.name.toLowerCase().includes(quickExpense.label.toLowerCase()) ||
      (quickExpense.category === 'food' && item.name.toLowerCase().includes('food')) ||
      (quickExpense.category === 'transport' && (item.name.toLowerCase().includes('transport') || item.name.toLowerCase().includes('car'))) ||
      (quickExpense.category === 'bills' && item.name.toLowerCase().includes('bill'))
    );

    if (matchingItem) {
      await onAddExpense(matchingItem.id, quickExpense.amount);
      setAmount('');
      setSelectedItemId('');
      setSelectedSubItems([]);
    } else {
      // If no matching item, pre-fill the form
      setAmount(quickExpense.amount.toString());
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-finance-primary" />
          Quick Expense Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Expense Buttons */}
        <div>
          <h4 className="text-sm font-medium mb-3">Common Expenses</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {quickExpenseCategories.map((quickExpense) => (
              <Button
                key={quickExpense.label}
                variant="outline"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => handleQuickExpense(quickExpense)}
                disabled={isLoading}
              >
                <quickExpense.icon className="h-4 w-4" />
                <span className="text-xs">{quickExpense.label}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(quickExpense.amount)}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Budget Item</label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a budget item" />
              </SelectTrigger>
              <SelectContent>
                {budgetItems.map(item => {
                  const remaining = item.amount - item.spent;
                  const isOverBudget = remaining < 0;
                  
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{item.name}</span>
                        <span className={`text-sm ml-2 ${isOverBudget ? 'text-red-500' : 'text-muted-foreground'}`}>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Sub-items (optional)</label>
              <div className="flex flex-wrap gap-2">
                {selectedItem.subItems.map(subItem => (
                  <Badge
                    key={subItem.id}
                    variant={selectedSubItems.includes(subItem.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedSubItems(prev =>
                        prev.includes(subItem.id)
                          ? prev.filter(id => id !== subItem.id)
                          : [...prev, subItem.id]
                      );
                    }}
                  >
                    {subItem.name} ({formatCurrency(subItem.amount)})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <div className="space-y-2">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              
              {/* Quick amount buttons */}
              <div className="flex gap-2">
                {quickAmounts.map(quickAmount => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    disabled={isLoading}
                  >
                    {formatCurrency(quickAmount)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!selectedItemId || !amount || isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickExpenseInput;
