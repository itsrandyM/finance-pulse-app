
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BudgetItem } from '@/contexts/BudgetContext';

interface ExpenseInputCardProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number) => void;
}

const ExpenseInputCard: React.FC<ExpenseInputCardProps> = ({
  budgetItems,
  onAddExpense,
}) => {
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [subItemExpenses, setSubItemExpenses] = useState<{ [key: string]: { amount: string; checked: boolean } }>({});

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);
  const hasSubItems = selectedItem?.subItems.length > 0;

  const handleSubItemChange = (subItemId: string, value: string) => {
    setSubItemExpenses(prev => ({
      ...prev,
      [subItemId]: { ...prev[subItemId], amount: value }
    }));
  };

  const handleSubItemCheck = (subItemId: string, checked: boolean) => {
    setSubItemExpenses(prev => ({
      ...prev,
      [subItemId]: {
        amount: checked ? (selectedItem?.subItems.find(si => si.id === subItemId)?.amount.toString() || '0') : '',
        checked
      }
    }));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      toast({
        title: "No Category Selected",
        description: "Please select a budget category.",
        variant: "destructive"
      });
      return;
    }
    
    let totalExpense = 0;

    if (hasSubItems) {
      // Calculate total from sub-items
      Object.entries(subItemExpenses).forEach(([_, value]) => {
        if (value.checked) {
          totalExpense += parseFloat(value.amount) || 0;
        }
      });
    } else {
      totalExpense = parseFloat(expenseAmount);
    }

    if (isNaN(totalExpense) || totalExpense <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive"
      });
      return;
    }
    
    onAddExpense(selectedItemId, totalExpense);
    setExpenseAmount('');
    setSubItemExpenses({});
    
    toast({
      title: "Expense Added",
      description: `$${totalExpense.toFixed(2)} expense recorded.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Budget Category</Label>
              <Select
                value={selectedItemId}
                onValueChange={(value) => {
                  setSelectedItemId(value);
                  setSubItemExpenses({});
                }}
              >
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && !hasSubItems && (
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Expense Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required={!hasSubItems}
                  />
                </div>
              </div>
            )}

            {selectedItem && hasSubItems && (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="text-sm font-medium">Sub-items:</div>
                {selectedItem.subItems.map((subItem) => (
                  <div key={subItem.id} className="flex items-center gap-4">
                    <Checkbox
                      id={`subitem-${subItem.id}`}
                      checked={subItemExpenses[subItem.id]?.checked || false}
                      onCheckedChange={(checked) => handleSubItemCheck(subItem.id, checked as boolean)}
                    />
                    <Label htmlFor={`subitem-${subItem.id}`} className="flex-1">
                      {subItem.name}
                    </Label>
                    <div className="relative w-32">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        type="number"
                        placeholder={subItem.amount.toString()}
                        step="0.01"
                        min="0"
                        className="pl-8"
                        value={subItemExpenses[subItem.id]?.amount || ''}
                        onChange={(e) => handleSubItemChange(subItem.id, e.target.value)}
                        disabled={!subItemExpenses[subItem.id]?.checked}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
            disabled={!selectedItemId || (!expenseAmount && !hasSubItems) || 
              (hasSubItems && !Object.values(subItemExpenses).some(v => v.checked))}
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseInputCard;
