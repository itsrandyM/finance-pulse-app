
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';

interface BudgetItemSelectorProps {
  budgetItems: BudgetItem[];
  selectedItemId: string;
  onSelectItem: (itemId: string) => void;
}

const BudgetItemSelector: React.FC<BudgetItemSelectorProps> = ({
  budgetItems,
  selectedItemId,
  onSelectItem
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">Budget Item</label>
      <Select value={selectedItemId} onValueChange={onSelectItem}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a budget item" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {budgetItems.map(item => {
            const remaining = item.amount - item.spent;
            const isOverBudget = remaining < 0;
            
            return (
              <SelectItem key={item.id} value={item.id} className="cursor-pointer">
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate flex-1 mr-2">{item.name}</span>
                  <span className={`text-xs flex-shrink-0 ${isOverBudget ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isOverBudget ? 'Over budget' : `${formatCurrency(remaining)} left`}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BudgetItemSelector;
