
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Calendar as CalendarIcon, Trash2, Note, Tag } from 'lucide-react';
import SubItemInput from './SubItemInput';
import NoteTagEditor from './NoteTagEditor';
import { BudgetItem, SubBudgetItem } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface BudgetItemsListProps {
  budgetItems: BudgetItem[];
  onDeleteItem: (id: string) => void;
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => void;
  onDeleteSubItem: (budgetItemId: string, subItemId: string) => void;
  onSetDeadline: (itemId: string) => void;
  showSubItems: { [key: string]: boolean };
  onToggleSubItems: (itemId: string) => void;
  onNavigateToTracking: () => void;
  onEditNoteTag?: (type: 'item'|'subItem', id: string, parentId?: string) => void;
  onSaveNoteTag?: (type: 'item'|'subItem', id: string, note: string, tag: string|null, parentId?: string) => void;
  editing?: { open: boolean; type: 'item' | 'subItem'; id: string; parentId?: string; };
  editingData?: { note: string; tag: string|null; };
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

const BudgetItemsList: React.FC<BudgetItemsListProps> = ({
  budgetItems,
  onDeleteItem,
  onAddSubItem,
  onDeleteSubItem,
  onSetDeadline,
  showSubItems,
  onToggleSubItems,
  onNavigateToTracking,
  onEditNoteTag,
  onSaveNoteTag,
  editing,
  editingData,
}) => {
  const [noteEditor, setNoteEditor] = useState<{
    open: boolean;
    type: 'item'|'subItem';
    id: string;
    parentId?: string;
    note: string;
    tag: string|null;
  }>({
    open: false,
    type: 'item',
    id: "",
    parentId: undefined,
    note: "",
    tag: null,
  });

  // Open note/tag editor for item or subItem
  const handleEditNoteTag = (
    type: 'item'|'subItem',
    id: string,
    currentNote: string,
    currentTag: string|null,
    parentId?: string
  ) => {
    setNoteEditor({
      open: true,
      type,
      id,
      parentId,
      note: currentNote,
      tag: currentTag ?? "",
    });
  };

  const handleSaveNoteTag = (note: string, tag: string|null) => {
    if (noteEditor.type === 'item') {
      onSaveNoteTag && onSaveNoteTag('item', noteEditor.id, note, tag);
    } else if (noteEditor.type === 'subItem' && noteEditor.parentId) {
      onSaveNoteTag && onSaveNoteTag('subItem', noteEditor.id, note, tag, noteEditor.parentId);
    }
    setNoteEditor({ ...noteEditor, open: false });
  };

  if (budgetItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Expenditure</h2>
      <div className="space-y-4">
        {budgetItems.map((item) => (
          <Collapsible key={item.id} open={showSubItems[item.id]}>
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggleSubItems(item.id)}
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
                    onClick={() => handleEditNoteTag(
                      'item',
                      item.id,
                      item.note || "",
                      item.tag || ""
                    )}
                    aria-label="Add/Edit note and tag"
                  >
                    <Note className="h-4 w-4" />
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
                    <Note className="inline h-3 w-3 mb-0.5" /> {item.note}
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
                  onClick={() => onDeleteItem(item.id)}
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
                // Add note & tag logic for subItems:
                renderActionsForSubItem={(sub: SubBudgetItem) => (
                  <React.Fragment>
                    <button
                      className="ml-1 text-gray-400 hover:text-finance-accent"
                      onClick={() => handleEditNoteTag(
                        'subItem',
                        sub.id,
                        sub.note || "",
                        sub.tag || "",
                        item.id
                      )}
                      aria-label="Add/Edit note and tag"
                    >
                      <Note className="h-4 w-4" />
                    </button>
                    {sub.tag && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTagColor(sub.tag)}`}>
                        <Tag className="inline h-3 w-3 mb-0.5 mr-1" />
                        {sub.tag}
                      </span>
                    )}
                  </React.Fragment>
                )}
                renderNoteForSubItem={(sub: SubBudgetItem) =>
                  sub.note && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 ml-6">
                      <Note className="inline h-3 w-3 mb-0.5" /> {sub.note}
                    </div>
                  )
                }
              />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Button 
          onClick={onNavigateToTracking}
          className="bg-finance-primary hover:bg-finance-primary/90"
          disabled={budgetItems.length === 0}
        >
          Continue to Tracking
        </Button>
      </div>

      {/* Note & tag editor dialog, rendered once */}
      {noteEditor.open && (
        <NoteTagEditor
          open={noteEditor.open}
          initialNote={noteEditor.note}
          initialTag={noteEditor.tag}
          isSubItem={noteEditor.type === 'subItem'}
          onClose={() => setNoteEditor({ ...noteEditor, open: false })}
          onSave={handleSaveNoteTag}
        />
      )}
    </div>
  );
};

export default BudgetItemsList;
