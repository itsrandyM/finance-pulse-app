
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import BudgetAllocationSummary from './budget/BudgetAllocationSummary';
import BudgetItemForm from './budget/BudgetItemForm';
import BudgetItemsList from './budget/BudgetItemsList';
import { format } from 'date-fns';

const BudgetAllocation: React.FC = () => {
  const { 
    totalBudget, 
    budgetItems, 
    addBudgetItem, 
    deleteBudgetItem,
    addSubItem,
    deleteSubItem,
    getTotalAllocated,
    updateItemDeadline
  } = useBudget();
  
  const navigate = useNavigate();
  const [showSubItems, setShowSubItems] = useState<{ [key: string]: boolean }>({});
  const [selectedItemForDeadline, setSelectedItemForDeadline] = useState<string | null>(null);

  const totalAllocated = getTotalAllocated();
  const remainingToAllocate = totalBudget - totalAllocated;

  const handleAddItem = (name: string, amount: number) => {
    addBudgetItem(name, amount, false);
  };

  const handleAddSubItem = (budgetItemId: string, name: string, amount: number) => {
    if (amount > 0) {
      addSubItem(budgetItemId, name, amount);
      setShowSubItems(prev => ({ ...prev, [budgetItemId]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BudgetAllocationSummary
        totalBudget={totalBudget}
        totalAllocated={totalAllocated}
        remainingToAllocate={remainingToAllocate}
      />

      <BudgetItemForm
        onAddItem={handleAddItem}
        totalBudget={totalBudget}
        totalAllocated={totalAllocated}
      />

      <BudgetItemsList
        budgetItems={budgetItems}
        onDeleteItem={deleteBudgetItem}
        onAddSubItem={handleAddSubItem}
        onDeleteSubItem={deleteSubItem}
        onSetDeadline={(itemId) => setSelectedItemForDeadline(itemId)}
        showSubItems={showSubItems}
        onToggleSubItems={(itemId) => 
          setShowSubItems(prev => ({ ...prev, [itemId]: !prev[itemId] }))}
        onNavigateToTracking={() => navigate('/tracking')}
      />

      <Dialog open={!!selectedItemForDeadline} onOpenChange={() => setSelectedItemForDeadline(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Deadline</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={budgetItems.find(item => item.id === selectedItemForDeadline)?.deadline}
            onSelect={(date) => {
              if (date && selectedItemForDeadline) {
                updateItemDeadline(selectedItemForDeadline, date);
                setSelectedItemForDeadline(null);
              }
            }}
            className="pointer-events-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetAllocation;
