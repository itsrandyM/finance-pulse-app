import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BudgetItem } from '@/contexts/BudgetContext';
import { useBudget } from '@/contexts/BudgetContext';
import NewExpenseForm from './NewExpenseForm';
import * as budgetService from '@/services/budgetService';

interface ExpenseInputCardProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number, subItemIds?: string[]) => Promise<void>;
}

const ExpenseInputCard: React.FC<ExpenseInputCardProps> = ({
  budgetItems,
  onAddExpense,
}) => {
  const { toast } = useToast();
  const { addBudgetItem, addSubItem, currentBudgetId } = useBudget();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [subItemExpenses, setSubItemExpenses] = useState<{ [key: string]: { amount: string; checked: boolean } }>({});
  const [showNewSubItemInput, setShowNewSubItemInput] = useState<boolean>(false);
  const [newSubItemName, setNewSubItemName] = useState<string>('');
  const [newSubItemAmount, setNewSubItemAmount] = useState<string>('');
  const [trackedSubItems, setTrackedSubItems] = useState<Record<string, boolean>>({});

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);
  const hasSubItems = selectedItem?.subItems.length > 0;

  useEffect(() => {
    const fetchSubItemExpenses = async () => {
      if (!selectedItem) return;
      
      const tracked: Record<string, boolean> = {};
      
      for (const subItem of selectedItem.subItems) {
        try {
          const expenses = await budgetService.getExpensesBySubItem(subItem.id);
          tracked[subItem.id] = expenses.length > 0;
        } catch (error) {
          console.error(`Error fetching expenses for sub-item ${subItem.id}:`, error);
        }
      }
      
      setTrackedSubItems(tracked);
    };
    
    if (selectedItem) {
      fetchSubItemExpenses();
    }
  }, [selectedItem]);

  const handleSubItemChange = (subItemId: string, value: string) => {
    setSubItemExpenses(prev => ({
      ...prev,
      [subItemId]: {
        ...prev[subItemId],
        amount: value,
        checked: true
      }
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

  const handleAddNewExpense = async (name: string, amount: number) => {
    if (!currentBudgetId) {
      toast({
        title: "Error adding expense",
        description: "No current budget found",
        variant: "destructive"
      });
      return;
    }

    try {
      const newItem = await budgetService.createBudgetItem(
        currentBudgetId,
        name,
        amount,
        true
      );

      await onAddExpense(newItem.id, amount);
      
      toast({
        title: "Expense Added",
        description: `Added and tracked new impulse expense: ${name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      toast({
        title: "No Category Selected",
        description: "Please select a budget category.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (hasSubItems) {
        const selectedSubItems = Object.entries(subItemExpenses)
          .filter(([_, value]) => value.checked)
          .map(([subItemId, value]) => ({
            id: subItemId,
            amount: parseFloat(value.amount)
          }));
        
        if (selectedSubItems.length === 0) {
          toast({
            title: "No Sub-items Selected",
            description: "Please select at least one sub-item.",
            variant: "destructive"
          });
          return;
        }
        
        let totalAmount = 0;
        const subItemIds: string[] = [];
        
        for (const { id, amount } of selectedSubItems) {
          if (isNaN(amount) || amount <= 0) continue;
          totalAmount += amount;
          subItemIds.push(id);
        }
        
        if (totalAmount <= 0) {
          toast({
            title: "Invalid Amount",
            description: "Please enter valid expense amounts.",
            variant: "destructive"
          });
          return;
        }
        
        await onAddExpense(selectedItemId, totalAmount, subItemIds);
      } else {
        const amount = parseFloat(expenseAmount);
        
        if (isNaN(amount) || amount <= 0) {
          toast({
            title: "Invalid Amount",
            description: "Please enter a valid expense amount.",
            variant: "destructive"
          });
          return;
        }
        
        await onAddExpense(selectedItemId, amount);
      }
      
      setExpenseAmount('');
      setSubItemExpenses({});
      
      toast({
        title: "Expense Added",
        description: "Your expense has been recorded.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddSubItem = async () => {
    if (selectedItemId && newSubItemName && newSubItemAmount) {
      const amount = parseFloat(newSubItemAmount);
      if (!isNaN(amount) && amount > 0) {
        try {
          await addSubItem(selectedItemId, newSubItemName, amount);
          setNewSubItemName('');
          setNewSubItemAmount('');
        } catch (error: any) {
          toast({
            title: "Error adding sub-item",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    }
  };

  return (
    <div className="bg-white shadow-none md:shadow-none px-0 py-0 md:px-0 md:py-0 transition-none w-full max-w-2xl mx-auto">
      <form onSubmit={handleAddExpense} className="space-y-6">
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
          <NewExpenseForm onAddNewExpense={handleAddNewExpense} />
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
                      className="pl-8 border-0 border-b border-finance-primary rounded-none bg-transparent focus:ring-0 focus:border-finance-primary"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {hasSubItems && (
                <div className="space-y-2">
                  <Label className="block mb-2">Track Sub-items</Label>
                  <div className="space-y-3 border border-b-0 border-x-0 border-t-0">
                    {selectedItem.subItems.map((subItem) => {
                      const isTracked = trackedSubItems[subItem.id] || subItem.hasExpenses;
                      
                      return (
                        <div 
                          key={subItem.id} 
                          className={cn(
                            "flex items-center gap-3 py-2",
                            isTracked ? "bg-green-50 px-2 rounded" : ""
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={subItemExpenses[subItem.id]?.checked || false}
                            onChange={(e) => handleSubItemCheck(subItem.id, e.target.checked)}
                            className="accent-finance-primary h-4 w-4"
                            id={`check-${subItem.id}`}
                          />
                          <Label 
                            htmlFor={`check-${subItem.id}`} 
                            className={cn(
                              "flex-1 cursor-pointer", 
                              isTracked ? "font-medium text-green-700" : ""
                            )}
                          >
                            {subItem.name}
                            {isTracked && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Tracked
                              </span>
                            )}
                          </Label>
                          <div className="relative w-32">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <Input
                              type="number"
                              placeholder={subItem.amount.toString()}
                              step="0.01"
                              min="0"
                              className={cn(
                                "pl-6 border-0 border-b border-finance-primary rounded-none bg-transparent focus:ring-0 focus:border-finance-primary",
                                isTracked ? "bg-green-50" : ""
                              )}
                              value={subItemExpenses[subItem.id]?.amount || ""}
                              onChange={(e) => handleSubItemChange(subItem.id, e.target.value)}
                              disabled={!subItemExpenses[subItem.id]?.checked}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {hasSubItems && !showNewSubItemInput && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewSubItemInput(true)}
                  className="w-full"
                >
                  + Add New Sub-item Expense
                </Button>
              )}
              {hasSubItems && showNewSubItemInput && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>New Sub-item Name</Label>
                    <Input
                      placeholder="Enter sub-item name"
                      value={newSubItemName}
                      onChange={(e) => setNewSubItemName(e.target.value)}
                      className="border-0 border-b border-finance-primary rounded-none bg-transparent focus:ring-0 focus:border-finance-primary"
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
                        className="pl-8 border-0 border-b border-finance-primary rounded-none bg-transparent focus:ring-0 focus:border-finance-primary"
                        value={newSubItemAmount}
                        onChange={(e) => setNewSubItemAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddSubItem}
                      className="flex-1"
                      disabled={!newSubItemName || !newSubItemAmount || parseFloat(newSubItemAmount) <= 0}
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
          )
        )}

        {selectedItemId && selectedItemId !== "new" && (
          <Button
            type="submit"
            className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
            disabled={
              !selectedItemId ||
              (!expenseAmount && !hasSubItems) ||
              (hasSubItems &&
                !Object.values(subItemExpenses).some((v) =>
                  v.checked && (!!v.amount && parseFloat(v.amount) > 0)
                )
              )
            }
          >
            Add Expense
          </Button>
        )}
      </form>
    </div>
  );
};

export default ExpenseInputCard;
