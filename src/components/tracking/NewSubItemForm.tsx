
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewSubItemFormProps {
  onAddSubItem: (name: string, amount: number) => Promise<any>;
  onCancel: () => void;
}

const NewSubItemForm: React.FC<NewSubItemFormProps> = ({
  onAddSubItem,
  onCancel
}) => {
  const [newSubItemName, setNewSubItemName] = useState('');
  const [newSubItemAmount, setNewSubItemAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
        setNewSubItemName('');
        setNewSubItemAmount('');
        onCancel();
        toast({ title: "Sub-item added", description: `${newSubItem.name} has been added and selected.` });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg border-finance-primary">
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
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isAdding}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export const NewSubItemFormTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="w-full">
      <Plus className="mr-2 h-4 w-4" />
      Add a new sub-item for this transaction
    </Button>
  );
};

export default NewSubItemForm;
