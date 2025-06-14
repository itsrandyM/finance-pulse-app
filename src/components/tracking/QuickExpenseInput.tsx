import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import BudgetItemSelector from './BudgetItemSelector';
import MultiSubItemsSelector from './MultiSubItemsSelector';
import QuickAmountButtons from './QuickAmountButtons';
import { DuplicateExpenseDialog } from './DuplicateExpenseDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/formatters';

interface SubItemAmount {
  id: string;
  amount: number;
}

interface QuickExpenseInputProps {
  budgetItems: BudgetItem[];
  onAddExpense: (itemId: string, amount: number, subItemIds?: string[]) => Promise<void>;
  isLoading: boolean;
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => Promise<any>;
}

interface ExpenseToConfirm {
  itemId: string;
  amount: number;
  subItemIds?: string[];
}

const QuickExpenseInput: React.FC<QuickExpenseInputProps> = ({
  budgetItems,
  onAddExpense,
  isLoading,
  onAddSubItem
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedSubItems, setSelectedSubItems] = useState<SubItemAmount[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [expenseToConfirm, setExpenseToConfirm] = useState<ExpenseToConfirm | null>(null);

  const selectedItem = budgetItems.find(item => item.id === selectedItemId);
  const itemToConfirmDetails = expenseToConfirm ? budgetItems.find(item => item.id === expenseToConfirm.itemId) : null;

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setSelectedSubItems([]);
    setAmount('');
  };

  const handleSubItemsChange = (subItems: SubItemAmount[]) => {
    setSelectedSubItems(subItems);
    
    // Auto-calculate total amount from selected sub-items
    if (subItems.length > 0) {
      const totalAmount = subItems.reduce((total, item) => total + item.amount, 0);
      setAmount(totalAmount.toString());
    } else {
      setAmount('');
    }
  };

  const handleAddSubItemForSelectedItem = (name: string, amount: number) => {
    if (!selectedItemId) {
      return Promise.reject(new Error("Cannot add sub-item without a selected budget item."));
    }
    return onAddSubItem(selectedItemId, name, amount);
  };
  
  const proceedWithAddExpense = async (itemId: string, expenseAmount: number, subItemIds?: string[]) => {
    await onAddExpense(itemId, expenseAmount, subItemIds);
    setAmount('');
    setSelectedSubItems([]);
  };

  const checkForDuplicateExpense = (itemId: string, expenseAmount: number): boolean => {
    const item = budgetItems.find(i => i.id === itemId);
    if (!item) return false;

    // Only check for single items (no sub-items) that have been previously tracked
    // AND where adding this expense would exceed the allocated amount
    const remainingBudget = item.amount - item.spent;
    return item.subItems.length === 0 && item.spent > 0 && expenseAmount > remainingBudget;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Extract sub-item IDs from selected sub-items
    const subItemIds = selectedSubItems.length > 0 
      ? selectedSubItems.map(item => item.id)
      : undefined;

    // Check for duplicate expenses on single items that would exceed budget
    if (!subItemIds && checkForDuplicateExpense(selectedItemId, numAmount)) {
      setExpenseToConfirm({ itemId: selectedItemId, amount: numAmount, subItemIds });
      setShowDuplicateDialog(true);
      return;
    }

    const remainingBudget = selectedItem ? selectedItem.amount - selectedItem.spent : 0;

    if (selectedItem && numAmount > remainingBudget) {
      setExpenseToConfirm({ itemId: selectedItemId, amount: numAmount, subItemIds });
      setShowConfirmation(true);
    } else {
      await proceedWithAddExpense(selectedItemId, numAmount, subItemIds);
    }
  };

  const handleConfirmExpense = async () => {
    if (expenseToConfirm) {
      await proceedWithAddExpense(
        expenseToConfirm.itemId,
        expenseToConfirm.amount,
        expenseToConfirm.subItemIds
      );
    }
    setShowConfirmation(false);
    setExpenseToConfirm(null);
  };

  const handleConfirmDuplicate = async () => {
    if (expenseToConfirm) {
      // Since we already know this exceeds the budget (that's why the duplicate dialog showed),
      // we can proceed directly to add the expense
      await proceedWithAddExpense(
        expenseToConfirm.itemId,
        expenseToConfirm.amount,
        expenseToConfirm.subItemIds
      );
      setExpenseToConfirm(null);
    }
  };

  return (
    <>
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
              <MultiSubItemsSelector
                selectedItem={selectedItem}
                selectedSubItems={selectedSubItems}
                onSubItemsChange={handleSubItemsChange}
                onAddSubItem={handleAddSubItemForSelectedItem}
              />
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium block">
                {selectedSubItems.length > 0 ? 'Total Amount (auto-calculated)' : 'Amount'}
              </label>
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg w-full"
                  disabled={selectedSubItems.length > 0} // Disable manual input when sub-items are selected
                />
                
                {selectedSubItems.length === 0 && (
                  <QuickAmountButtons
                    onSelectAmount={handleQuickAmount}
                    isLoading={isLoading}
                  />
                )}

                {selectedSubItems.length > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    Amount is automatically calculated from selected sub-items. 
                    Clear sub-item selections to enter a custom amount.
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10" 
              disabled={!selectedItemId || !amount || isLoading}
            >
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {isLoading ? 'Adding...' : 
                 selectedSubItems.length > 0 ? `Add ${selectedSubItems.length} Item${selectedSubItems.length !== 1 ? 's' : ''}` : 
                 'Add Expense'}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Duplicate Expense Dialog */}
      <DuplicateExpenseDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        onConfirm={handleConfirmDuplicate}
        itemName={selectedItem?.name || ''}
        amount={expenseToConfirm?.amount || 0}
      />
      
      {/* Budget Exceeded Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This expense exceeds your budget</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToConfirmDetails && expenseToConfirm && (
                <>
                  Adding an expense of{' '}
                  <span className="font-semibold">{formatCurrency(expenseToConfirm.amount)}</span> to "
                  {itemToConfirmDetails.name}" will exceed its remaining budget.
                  <br /><br />
                  <span className="font-medium">Remaining Budget:</span> {formatCurrency(itemToConfirmDetails.amount - itemToConfirmDetails.spent)}
                  <br />
                  <span className="font-medium">Exceeds by:</span>{' '}
                  <span className="text-finance-accent font-semibold">
                    {formatCurrency(expenseToConfirm.amount - (itemToConfirmDetails.amount - itemToConfirmDetails.spent))}
                  </span>
                  <br /><br />
                  Are you sure you want to continue?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExpense}>Yes, Add Expense</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuickExpenseInput;
