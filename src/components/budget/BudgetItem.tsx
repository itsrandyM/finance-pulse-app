
import React from 'react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Trash2, FileText, Tag } from 'lucide-react';
import { BudgetItem as BudgetItemType } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import SubItemInput from './SubItemInput';

interface BudgetItemProps {
  item: BudgetItemType;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => void;
  onDeleteSubItem: (budgetItemId: string, subItemId: string) => void;
  onSetDeadline: (itemId: string) => void;
  onEditNoteTag: (type: 'item', id: string, note: string, tag: string|null) => void;
}

const getTagColor = (tag: string | null | undefined) => {
  // This matches the palette in the visual summary card
  const colorMap: Record<string, string> = {
    Bills: 'bg-orange-200 text-orange-800',
    Savings: 'bg-green-200 text-green-800',
    Groceries: 'bg-blue-200 text-blue-800',
    Transport: 'bg-sky-200 text-sky-800',
    Shopping: 'bg-pink-200 text-pink-800',
    Dining: 'bg-purple-200 text-purple-800',
  }
  if (!tag) return 'bg-gray-100 text-gray-500';
  return colorMap[tag] || 'bg-gray-200 text-gray-700';
};

const BudgetItemComponent: React.FC<BudgetItemProps> = ({
  item,
  isOpen,
  onToggle,
  onDelete,
  onAddSubItem,
  onDeleteSubItem,
  onSetDeadline,
  onEditNoteTag,
}) => {
  return (
    <Collapsible key={item.id} open={isOpen}>
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggle}
              className="flex items-center gap-2 hover:text-finance-primary transition-colors"
            >
              <span className="font-medium">{item.name}</span>
            </button>
            {item.isImpulse && (
              <span className="px-2 py-1 text-xs bg-finance-warning/10 text-finance-warning rounded-full">
                Impulse
              </span>
            )}
            <button
              className="ml-1 text-gray-400 hover:text-finance-accent"
              onClick={() => onEditNoteTag(
                'item',
                item.id,
                item.note || "",
                item.tag || ""
              )}
              aria-label="Add/Edit note and tag"
            >
              <FileText className="h-4 w-4" />
            </button>
            {item.tag && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTagColor(item.tag)}`}>
                <Tag className="inline h-3 w-3 mb-0.5 mr-1" />
                {item.tag}
              </span>
            )}
          </div>
          {item.note && (
            <div className="text-xs text-gray-600 flex items-center gap-1 ml-6">
              <FileText className="inline h-3 w-3 mb-0.5" /> {item.note}
            </div>
          )}
          <span className="font-mono text-base">{formatCurrency(item.amount)}</span>
        </div>
        <div className="flex gap-2 ml-2 flex-col items-end min-w-[108px]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDeadline(item.id)}
            className="border-b-2 border-t-0 border-x-0 rounded-none hover:bg-transparent"
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            {item.deadline ? format(new Date(item.deadline), 'PP') : 'Add Deadline'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="text-finance-danger hover:text-finance-danger/80"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <SubItemInput
          budgetItemId={item.id}
          subItems={item.subItems}
          onAddSubItem={onAddSubItem}
          onDeleteSubItem={onDeleteSubItem}
          budgetItemAmount={item.amount}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BudgetItemComponent;
