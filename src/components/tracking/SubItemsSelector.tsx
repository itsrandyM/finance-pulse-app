
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';

interface SubItemsSelectorProps {
  selectedItem: BudgetItem | undefined;
  selectedSubItems: string[];
  onToggleSubItem: (subItemId: string) => void;
}

const SubItemsSelector: React.FC<SubItemsSelectorProps> = ({
  selectedItem,
  selectedSubItems,
  onToggleSubItem
}) => {
  if (!selectedItem || selectedItem.subItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">Sub-items (optional)</label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
        {selectedItem.subItems.map(subItem => (
          <Badge
            key={subItem.id}
            variant={selectedSubItems.includes(subItem.id) ? "default" : "outline"}
            className="cursor-pointer text-xs px-2 py-1 truncate max-w-full"
            onClick={() => onToggleSubItem(subItem.id)}
          >
            <span className="truncate">{subItem.name}</span>
            <span className="ml-1 flex-shrink-0">({formatCurrency(subItem.amount)})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SubItemsSelector;
