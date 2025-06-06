
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BudgetItem } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedSubItems, setSelectedSubItems] = useState<string[]>([]);
  const { toast } = useToast();

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);
  const hasSubItems = selectedItem?.subItems && selectedItem.subItems.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || !amount) {
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
      if (hasSubItems && selectedSubItems.length > 0) {
        await onAddExpense(selectedItemId, numericAmount, selectedSubItems);
      } else {
        await onAddExpense(selectedItemId, numericAmount);
      }
      
      // Reset form
      setSelectedItemId('');
      setAmount('');
      setSelectedSubItems([]);
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
              value={selectedItemId} 
              onValueChange={(value) => {
                setSelectedItemId(value);
                setSelectedSubItems([]);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {budgetItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.amount - item.spent} remaining
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasSubItems && (
            <div className="space-y-2">
              <Label>Sub-items (optional)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedItem?.subItems.map((subItem) => (
                  <div key={subItem.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`sub-${subItem.id}`}
                      checked={selectedSubItems.includes(subItem.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubItems([...selectedSubItems, subItem.id]);
                        } else {
                          setSelectedSubItems(selectedSubItems.filter(id => id !== subItem.id));
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Label htmlFor={`sub-${subItem.id}`} className="text-sm">
                      {subItem.name} (KSh {subItem.amount})
                    </Label>
                  </div>
                ))}
              </div>
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
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !selectedItemId || !amount}
          >
            {isLoading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleExpenseInput;
