import React, { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Calculator, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DuplicateExpenseDialog } from './DuplicateExpenseDialog';

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
  const [newSubItemName, setNewSubItemName] = useState('');
  const [newSubItemAmount, setNewSubItemAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingSubItem, setPendingSubItem] = useState<{ id: string; amount: number } | null>(null);
  const { toast } = useToast();

  if (!selectedItem) {
    return null;
  }

  const checkForDuplicateSubItem = (subItemId: string, amount: number): boolean => {
    const subItem = selectedItem.subItems.find(s => s.id === subItemId);
    if (!subItem) return false;

    // Check if this sub-item has been previously tracked (spent > 0) 
    // AND if adding this amount would exceed its allocated budget
    const remainingBudget = subItem.amount - subItem.spent;
    return subItem.spent > 0 && amount > remainingBudget;
  };

  const handleSubItemToggle = (subItemId: string, defaultAmount: number) => {
    const isSelected = selectedSubItems.some(item => item.id === subItemId);
    
    if (isSelected) {
      // Remove the sub-item
      onSubItemsChange(selectedSubItems.filter(item => item.id !== subItemId));
    } else {
      // Check for duplicate before adding
      if (checkForDuplicateSubItem(subItemId, defaultAmount)) {
        const subItem = selectedItem.subItems.find(s => s.id === subItemId);
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

  const handleAddSubItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newSubItemAmount);
    if (!newSubItemName.trim() || isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid input", description: "Please provide a valid name and amount.", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    try {
      const newSubItem = await onAddSubItem(newSubItemName, amount);
      if (newSubItem) {
        // Auto-select the newly created sub-item
        onSubItemsChange([...selectedSubItems, { id: newSubItem.id, amount: newSubItem.amount }]);
        setNewSubItemName('');
        setNewSubItemAmount('');
        setShowAddForm(false);
        toast({ title: "Sub-item added", description: `${newSubItem.name} has been added and selected.` });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const getTotalSelectedAmount = () => {
    return selectedSubItems.reduce((total, item) => total + item.amount, 0);
  };

  const clearAllSelections = () => {
    onSubItemsChange([]);
  };

  const getSubItemWarning = (subItemId: string) => {
    const subItem = selectedItem.subItems.find(s => s.id === subItemId);
    if (!subItem || subItem.spent === 0) return null;
    
    const remainingBudget = subItem.amount - subItem.spent;
    if (remainingBudget <= 0) {
      return "Already fully spent";
    }
    return `Previously tracked: ${formatCurrency(subItem.spent)}`;
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
              const warning = getSubItemWarning(subItem.id);

              return (
                <div key={subItem.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`multi-sub-${subItem.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleSubItemToggle(subItem.id, subItem.amount)}
                      />
                      <Label htmlFor={`multi-sub-${subItem.id}`} className="font-normal cursor-pointer">
                        {subItem.name}
                        {warning && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            {warning}
                          </div>
                        )}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(subItem.amount)}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="ml-6 flex items-center space-x-2">
                      <Label htmlFor={`amount-${subItem.id}`} className="text-xs whitespace-nowrap">
                        Actual amount:
                      </Label>
                      <Input
                        id={`amount-${subItem.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={selectedSubItem.amount}
                        onChange={(e) => handleAmountChange(subItem.id, parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedSubItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Total selected: {formatCurrency(getTotalSelectedAmount())}
            </span>
            <span className="text-xs text-blue-600">
              ({selectedSubItems.length} item{selectedSubItems.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {!showAddForm && (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add a new sub-item for this transaction
          </Button>
        )}

        {showAddForm && (
          <form onSubmit={handleAddSubItem} className="space-y-3 p-3 border rounded-lg border-finance-primary">
            <p className="text-sm font-medium">New Sub-item</p>
            <Input
              placeholder="Sub-item name"
              value={newSubItemName}
              onChange={(e) => setNewSubItemName(e.target.value)}
              disabled={isAdding}
            />
            <Input
              type="number"
              placeholder="Amount"
              step="0.01"
              min="0"
              value={newSubItemAmount}
              onChange={(e) => setNewSubItemAmount(e.target.value)}
              disabled={isAdding}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isAdding} className="flex-1">
                {isAdding ? 'Adding...' : 'Add & Select'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} disabled={isAdding}>
                Cancel
              </Button>
            </div>
          </form>
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
