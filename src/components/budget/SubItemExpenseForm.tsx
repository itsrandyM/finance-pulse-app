
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SubBudgetItem } from '@/contexts/BudgetContext';
import { Checkbox } from '@/components/ui/checkbox';

interface SubItemExpenseFormProps {
  subItems: SubBudgetItem[];
  onSubItemChange: (subItemId: string, value: string) => void;
  onSubItemCheck: (subItemId: string, checked: boolean) => void;
  subItemExpenses: { [key: string]: { amount: string; checked: boolean } };
}

const SubItemExpenseForm: React.FC<SubItemExpenseFormProps> = ({
  subItems,
  onSubItemChange,
  onSubItemCheck,
  subItemExpenses,
}) => {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="text-sm font-medium">Sub-items:</div>
      {subItems.map((subItem) => (
        <div key={subItem.id} className="flex items-center gap-4">
          <Checkbox
            id={`subitem-${subItem.id}`}
            checked={subItemExpenses[subItem.id]?.checked || false}
            onCheckedChange={(checked) => onSubItemCheck(subItem.id, checked as boolean)}
          />
          <Label htmlFor={`subitem-${subItem.id}`} className="flex-1">
            {subItem.name}
          </Label>
          <div className="relative w-32">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              type="number"
              placeholder={subItem.amount.toString()}
              step="0.01"
              min="0"
              className="pl-8"
              value={subItemExpenses[subItem.id]?.amount || ''}
              onChange={(e) => onSubItemChange(subItem.id, e.target.value)}
              disabled={!subItemExpenses[subItem.id]?.checked}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubItemExpenseForm;
