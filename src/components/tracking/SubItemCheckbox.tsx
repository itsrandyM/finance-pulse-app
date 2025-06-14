
import React from 'react';
import { SubBudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';

interface SubItemAmount {
  id: string;
  amount: number;
}

interface SubItemCheckboxProps {
  subItem: SubBudgetItem;
  isSelected: boolean;
  selectedAmount: number;
  isTracked: boolean;
  onToggle: (subItemId: string, defaultAmount: number) => void;
  onAmountChange: (subItemId: string, amount: number) => void;
  onTrackedCheckboxClick: (subItemId: string) => void;
}

const SubItemCheckbox: React.FC<SubItemCheckboxProps> = ({
  subItem,
  isSelected,
  selectedAmount,
  isTracked,
  onToggle,
  onAmountChange,
  onTrackedCheckboxClick
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`multi-sub-${subItem.id}`}
            checked={isSelected}
            onCheckedChange={() => onToggle(subItem.id, subItem.amount)}
          />
          <Label htmlFor={`multi-sub-${subItem.id}`} className="font-normal cursor-pointer">
            {subItem.name}
            {isTracked && (
              <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                <Check className="h-3 w-3" />
                <span>Tracked</span>
                <Checkbox
                  checked={false}
                  onCheckedChange={() => onTrackedCheckboxClick(subItem.id)}
                  className="h-3 w-3 opacity-50"
                />
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
            value={selectedAmount}
            onChange={(e) => onAmountChange(subItem.id, parseFloat(e.target.value) || 0)}
            className="w-24 h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default SubItemCheckbox;
