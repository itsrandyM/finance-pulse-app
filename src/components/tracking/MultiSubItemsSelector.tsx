
import React, { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DuplicateExpenseDialog } from './DuplicateExpenseDialog';
import SubItemCheckbox from './SubItemCheckbox';
import NewSubItemForm, { NewSubItemFormTrigger } from './NewSubItemForm';
import SelectedSubItemsSummary from './SelectedSubItemsSummary';

interface SubItemAmount {
  id: string;
  amount: number;
}

interface MultiSubItemsSelectorProps {
  selectedItem: BudgetItem | undefined;
  selectedSubItems: SubItemAmount[];
  onSubItemsChange: (subItems: SubItemAmount[]) => void;
  onAddSubItem: (name: string, amount: number) => Promise<any>;
}

const MultiSubItemsSelector: React.FC<MultiSubItemsSelectorProps> = ({
  selectedItem,
  selectedSubItems,
  onSubItemsChange,
  onAddSubItem
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingSubItem, setPendingSubItem] = useState<{ id: string; amount: number } | null>(null);
  const { toast } = useToast();

  if (!selectedItem) {
    return null;
  }

  // Helper function to get sub-item spent amount from the parent item's expenses
  const getSubItemSpent = (subItemId: string): number => {
    // In the budget context, sub-item expenses are tracked within the parent item
    // We need to check if this sub-item has any tracked expenses
    // For now, we'll use a simple heuristic based on the parent item's structure
    const subItem = selectedItem.subItems.find(s => s.id === subItemId);
    if (!subItem) return 0;
    
    // This is a placeholder - in a real implementation, you'd track sub-item expenses separately
    // For now, we'll assume if the parent item has any spending, sub-items might have been tracked
    return selectedItem.spent > 0 ? selectedItem.spent / selectedItem.subItems.length : 0;
  };

  const checkForDuplicateSubItem = (subItemId: string, amount: number): boolean => {
    const subItem = selectedItem.subItems.find(s => s.id === subItemId);
    if (!subItem) return false;

    const spentAmount = getSubItemSpent(subItemId);
    // Check if this sub-item has been previously tracked (spent > 0) 
    // AND if adding this amount would exceed its allocated budget
    const remainingBudget = subItem.amount - spentAmount;
    return spentAmount > 0 && amount > remainingBudget;
  };

  const handleSubItemToggle = (subItemId: string, defaultAmount: number) => {
    const isSelected = selectedSubItems.some(item => item.id === subItemId);
    
    if (isSelected) {
      // Remove the sub-item
      onSubItemsChange(selectedSubItems.filter(item => item.id !== subItemId));
    } else {
      // Check for duplicate before adding
      if (checkForDuplicateSubItem(subItemId, defaultAmount)) {
        setPendingSubItem({ id: subItemId, amount: defaultAmount });
        setShowDuplicateDialog(true);
        return;
      }
      
      // Add the sub-item with default amount
      onSubItemsChange([...selectedSubItems, { id: subItemId, amount: defaultAmount }]);
    }
  };

  const handleAmountChange = (subItemId: string, amount: number) => {
    // Check for duplicate when amount changes
    if (checkForDuplicateSubItem(subItemId, amount)) {
      const subItem = selectedItem.subItems.find(s => s.id === subItemId);
      toast({
        title: "Budget Exceeded",
        description: `This amount would exceed the remaining budget for ${subItem?.name}`,
        variant: "destructive"
      });
      return;
    }

    onSubItemsChange(
      selectedSubItems.map(item =>
        item.id === subItemId ? { ...item, amount } : item
      )
    );
  };

  const handleConfirmDuplicate = () => {
    if (pendingSubItem) {
      onSubItemsChange([...selectedSubItems, pendingSubItem]);
      setPendingSubItem(null);
    }
    setShowDuplicateDialog(false);
  };

  const handleAddSubItem = async (name: string, amount: number) => {
    const newSubItem = await onAddSubItem(name, amount);
    if (newSubItem) {
      // Auto-select the newly created sub-item
      onSubItemsChange([...selectedSubItems, { id: newSubItem.id, amount: newSubItem.amount }]);
    }
    return newSubItem;
  };

  const clearAllSelections = () => {
    onSubItemsChange([]);
  };

  const isSubItemTracked = (subItemId: string): boolean => {
    const spentAmount = getSubItemSpent(subItemId);
    return spentAmount > 0;
  };

  const handleTrackedCheckboxClick = (subItemId: string) => {
    const subItem = selectedItem.subItems.find(s => s.id === subItemId);
    if (subItem) {
      setPendingSubItem({ id: subItemId, amount: subItem.amount });
      setShowDuplicateDialog(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Sub-items for this transaction</label>
          {selectedSubItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllSelections} className="h-auto px-2 py-1 text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
        
        {selectedItem.subItems.length > 0 && (
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            {selectedItem.subItems.map(subItem => {
              const selectedSubItem = selectedSubItems.find(item => item.id === subItem.id);
              const isSelected = !!selectedSubItem;
              const isTracked = isSubItemTracked(subItem.id);

              return (
                <SubItemCheckbox
                  key={subItem.id}
                  subItem={subItem}
                  isSelected={isSelected}
                  selectedAmount={selectedSubItem?.amount || 0}
                  isTracked={isTracked}
                  onToggle={handleSubItemToggle}
                  onAmountChange={handleAmountChange}
                  onTrackedCheckboxClick={handleTrackedCheckboxClick}
                />
              );
            })}
          </div>
        )}

        <SelectedSubItemsSummary selectedSubItems={selectedSubItems} />

        {!showAddForm ? (
          <NewSubItemFormTrigger onClick={() => setShowAddForm(true)} />
        ) : (
          <NewSubItemForm
            onAddSubItem={handleAddSubItem}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>

      <DuplicateExpenseDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        onConfirm={handleConfirmDuplicate}
        itemName={pendingSubItem ? selectedItem.subItems.find(s => s.id === pendingSubItem.id)?.name || '' : ''}
        amount={pendingSubItem?.amount || 0}
      />
    </>
  );
};

export default MultiSubItemsSelector;
