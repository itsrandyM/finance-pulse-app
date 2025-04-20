
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import SubItemInput from './SubItemInput';
import { BudgetItem } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';

interface BudgetItemsListProps {
  budgetItems: BudgetItem[];
  onDeleteItem: (id: string) => void;
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => void;
  onDeleteSubItem: (budgetItemId: string, subItemId: string) => void;
  onSetDeadline: (itemId: string) => void;
  showSubItems: { [key: string]: boolean };
  onToggleSubItems: (itemId: string) => void;
  onNavigateToTracking: () => void;
}

const BudgetItemsList: React.FC<BudgetItemsListProps> = ({
  budgetItems,
  onDeleteItem,
  onAddSubItem,
  onDeleteSubItem,
  onSetDeadline,
  showSubItems,
  onToggleSubItems,
  onNavigateToTracking,
}) => {
  if (budgetItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Budget Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetItems.map((item) => (
            <Collapsible key={item.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.isImpulse && (
                      <span className="px-2 py-1 text-xs bg-finance-warning text-white rounded-full">
                        Impulse
                      </span>
                    )}
                  </div>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleSubItems(item.id)}
                  >
                    Add Items
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetDeadline(item.id)}
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {item.deadline ? format(new Date(item.deadline), 'PP') : 'Add Deadline'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteItem(item.id)}
                    className="h-8 w-8 text-finance-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {showSubItems[item.id] && (
                <CollapsibleContent>
                  <SubItemInput
                    budgetItemId={item.id}
                    subItems={item.subItems}
                    onAddSubItem={onAddSubItem}
                    onDeleteSubItem={onDeleteSubItem}
                    budgetItemAmount={item.amount}
                  />
                </CollapsibleContent>
              )}
            </Collapsible>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onNavigateToTracking}
          className="bg-finance-primary hover:bg-finance-secondary"
          disabled={budgetItems.length === 0}
        >
          Continue to Tracking
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BudgetItemsList;
