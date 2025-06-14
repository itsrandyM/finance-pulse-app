import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BudgetItem } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { useBudget } from '@/contexts/BudgetContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SimpleExpenseInputProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number, subItemIds?: string[]) => Promise<void>;
  isLoading: boolean;
}

const SimpleExpenseInput: React.FC<SimpleExpenseInputProps> = ({
  budgetItems,
  onAddExpense,
  isLoading,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedSubItemId, setSelectedSubItemId] = useState<string | null>(null);
  const [isNewItem, setIsNewItem] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const { toast } = useToast();
  const { addBudgetItem } = useBudget();

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);
  const hasSubItems = selectedItem?.subItems && selectedItem.subItems.length > 0;

  const handleItemChange = (value: string) => {
    if (value === 'new-item') {
      setIsNewItem(true);
      setSelectedItemId('');
      setSelectedSubItemId(null);
      setAmount('');
    } else {
      setIsNewItem(false);
      setSelectedItemId(value);
      setSelectedSubItemId(null);
      
      // Prepopulate amount with remaining budget for the item
      const item = budgetItems.find(item => item.id === value);
      if (item) {
        const remaining = item.amount - item.spent;
        setAmount(remaining > 0 ? remaining.toString() : '');
      }
    }
  };

  const handleSubItemChange = (subItemId: string) => {
    setSelectedSubItemId(subItemId);
    if (selectedItem) {
      const subItem = selectedItem.subItems.find(sub => sub.id === subItemId);
      if (subItem) {
        setAmount(subItem.amount.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewItem && (!newItemName.trim() || !amount)) {
      toast({
        title: "Missing Information",
        description: "Please enter a name and amount for the new expense.",
        variant: "destructive"
      });
      return;
    }

    if (!isNewItem && (!selectedItemId || !amount)) {
      toast({
        title: "Missing Information",
        description: "Please select an item and enter an amount.",
        variant: "destructive"
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isNewItem) {
        // Create new impulse item and add expense to it
        await addBudgetItem(newItemName.trim(), numericAmount, true);
        toast({
          title: "New Expense Added",
          description: `"${newItemName.trim()}" added as an unbudgeted expense of ${formatCurrency(numericAmount)}.`,
        });
      } else {
        // Add expense to existing item, with optional single sub-item
        await onAddExpense(selectedItemId, numericAmount, selectedSubItemId ? [selectedSubItemId] : undefined);
        
        toast({
          title: "Expense Added",
          description: `Expense of ${formatCurrency(numericAmount)} added successfully.`,
        });
      }
      
      // Reset form
      setSelectedItemId('');
      setAmount('');
      setSelectedSubItemId(null);
      setIsNewItem(false);
      setNewItemName('');
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Budget Category</Label>
            <Select 
              value={isNewItem ? 'new-item' : selectedItemId} 
              onValueChange={handleItemChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category or add new" />
              </SelectTrigger>
              <SelectContent>
                {budgetItems.map((item) => {
                  const remaining = item.amount - item.spent;
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{item.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatCurrency(remaining)} remaining
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
                <SelectItem value="new-item">
                  <div className="flex items-center">
                    <span className="text-blue-600 font-medium">+ Add New Unbudgeted Expense</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isNewItem && (
            <div className="space-y-2">
              <Label>Expense Name</Label>
              <Input
                type="text"
                placeholder="e.g., Emergency repair, Unexpected purchase"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                disabled={isLoading}
              />
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                This will be added as an unbudgeted expense
              </div>
            </div>
          )}

          {!isNewItem && hasSubItems && (
            <div className="space-y-3">
              <Label>Sub-categories (optional)</Label>
              <RadioGroup
                value={selectedSubItemId || ""}
                onValueChange={handleSubItemChange}
                className="border rounded-lg p-3 space-y-3 max-h-40 overflow-y-auto"
              >
                {selectedItem?.subItems.map((subItem) => (
                  <div key={subItem.id} className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem
                        value={subItem.id}
                        id={`simple-sub-${subItem.id}`}
                      />
                      <Label 
                        htmlFor={`simple-sub-${subItem.id}`} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {subItem.name}
                      </Label>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {formatCurrency(subItem.amount)}
                    </div>
                  </div>
                ))}
              </RadioGroup>
              {selectedSubItemId && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  1 sub-item selected
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                KSh
              </span>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12"
                disabled={isLoading}
              />
            </div>
            {!isNewItem && selectedItem && (
              <div className="text-xs text-gray-500">
                Budget: {formatCurrency(selectedItem.amount)} | 
                Spent: {formatCurrency(selectedItem.spent)} | 
                Remaining: {formatCurrency(selectedItem.amount - selectedItem.spent)}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || (!isNewItem && !selectedItemId) || !amount || (isNewItem && !newItemName.trim())}
          >
            {isLoading ? 'Adding...' : isNewItem ? 'Add New Expense' : 'Add Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleExpenseInput;
