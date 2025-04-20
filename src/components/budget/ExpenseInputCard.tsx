import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BudgetItem } from '@/contexts/BudgetContext';
import { useBudget } from '@/contexts/BudgetContext';

interface ExpenseInputCardProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number) => void;
}

const ExpenseInputCard: React.FC<ExpenseInputCardProps> = ({
  budgetItems,
  onAddExpense,
}) => {
  const { toast } = useToast();
  const { addBudgetItem, addSubItem } = useBudget();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [newItemName, setNewItemName] = useState<string>('');
  const [subItemExpenses, setSubItemExpenses] = useState<{ [key: string]: { amount: string; checked: boolean } }>({});
  const [showNewSubItemInput, setShowNewSubItemInput] = useState<boolean>(false);
  const [newSubItemName, setNewSubItemName] = useState<string>('');
  const [newSubItemAmount, setNewSubItemAmount] = useState<string>('');

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

  const handleAddNewBudgetItem = () => {
    if (!newItemName || !expenseAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter both name and amount for the new expense.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive"
      });
      return;
    }

    // Add new budget item with isImpulse flag
    addBudgetItem(newItemName, amount, true);
    setNewItemName('');
    setExpenseAmount('');
    toast({
      title: "Expense Added",
      description: `Added new impulse expense: ${newItemName}`,
    });
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
                  setShowNewSubItemInput(false);
                }}
              >
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Add New Expense</SelectItem>
                  {budgetItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItemId === 'new' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-item-name">Expense Name</Label>
                  <Input
                    id="new-item-name"
                    placeholder="Enter expense name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-item-amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <Input
                      id="new-item-amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  type="button"
                  onClick={handleAddNewBudgetItem}
                  className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
                >
                  Add New Expense
                </Button>
              </div>
            ) : (
              selectedItem && (
                <div className="space-y-4">
                  {!hasSubItems && (
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
                        />
                      </div>
                    </div>
                  )}

                  {hasSubItems && (
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
                      
                      {/* Add new sub-item expense button and input */}
                      {!showNewSubItemInput ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewSubItemInput(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Sub-item Expense
                        </Button>
                      ) : (
                        <div className="space-y-4 border-t pt-4">
                          <div className="space-y-2">
                            <Label>New Sub-item Name</Label>
                            <Input
                              placeholder="Enter sub-item name"
                              value={newSubItemName}
                              onChange={(e) => setNewSubItemName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500">$</span>
                              </div>
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="pl-8"
                                value={newSubItemAmount}
                                onChange={(e) => setNewSubItemAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => {
                                if (selectedItemId && newSubItemName && newSubItemAmount) {
                                  const amount = parseFloat(newSubItemAmount);
                                  if (!isNaN(amount) && amount > 0) {
                                    addSubItem(selectedItemId, newSubItemName, amount);
                                    setNewSubItemName('');
                                    setNewSubItemAmount('');
                                    setShowNewSubItemInput(false);
                                  }
                                }
                              }}
                              className="flex-1"
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowNewSubItemInput(false);
                                setNewSubItemName('');
                                setNewSubItemAmount('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
          
          {selectedItemId && selectedItemId !== 'new' && (
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
              disabled={!selectedItemId || (!expenseAmount && !hasSubItems) || 
                (hasSubItems && !Object.values(subItemExpenses).some(v => v.checked))}
            >
              Add Expense
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseInputCard;
