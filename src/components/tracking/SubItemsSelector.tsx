
import React, { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubItemsSelectorProps {
  selectedItem: BudgetItem | undefined;
  selectedSubItemId: string | null;
  onSelectSubItem: (subItemId: string, amount: number) => void;
  onDeselectSubItem: () => void;
  onAddSubItem: (name: string, amount: number) => Promise<any>;
}

const SubItemsSelector: React.FC<SubItemsSelectorProps> = ({
  selectedItem,
  selectedSubItemId,
  onSelectSubItem,
  onDeselectSubItem,
  onAddSubItem
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubItemName, setNewSubItemName] = useState('');
  const [newSubItemAmount, setNewSubItemAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  if (!selectedItem) {
    return null;
  }

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
        onSelectSubItem(newSubItem.id, newSubItem.amount);
        setNewSubItemName('');
        setNewSubItemAmount('');
        setShowAddForm(false);
        toast({ title: "Sub-item added", description: `${newSubItem.name} has been added.` });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleValueChange = (value: string) => {
    if (value) {
      const subItem = selectedItem.subItems.find(si => si.id === value);
      if (subItem) {
        onSelectSubItem(subItem.id, subItem.amount);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Sub-items (optional)</label>
        {selectedSubItemId && (
          <Button variant="ghost" size="sm" onClick={onDeselectSubItem} className="h-auto px-2 py-1 text-xs">
            <X className="mr-1 h-3 w-3" />
            Clear selection
          </Button>
        )}
      </div>
      
      {selectedItem.subItems.length > 0 && (
         <RadioGroup
          value={selectedSubItemId || ''}
          onValueChange={handleValueChange}
          className="space-y-2 p-3 border rounded-lg bg-gray-50"
        >
          {selectedItem.subItems.map(subItem => (
            <div key={subItem.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={subItem.id} id={`sub-${subItem.id}`} />
                <Label htmlFor={`sub-${subItem.id}`} className="font-normal cursor-pointer">
                  {subItem.name}
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">{formatCurrency(subItem.amount)}</span>
            </div>
          ))}
        </RadioGroup>
      )}

      {!showAddForm && (
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add a new sub-item for this expense
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
  );
};

export default SubItemsSelector;
