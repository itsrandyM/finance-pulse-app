
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import NoteTagEditor from './NoteTagEditor';
import { BudgetItem, SubBudgetItem } from '@/contexts/BudgetContext';
import BudgetItemComponent from './BudgetItem';

interface BudgetItemsListProps {
  budgetItems: BudgetItem[];
  onDeleteItem: (id: string) => void;
  onAddSubItem: (budgetItemId: string, name: string, amount: number) => void;
  onDeleteSubItem: (budgetItemId: string, subItemId: string) => void;
  onSetDeadline: (itemId: string) => void;
  showSubItems: { [key: string]: boolean };
  onToggleSubItems: (itemId: string) => void;
  onNavigateToTracking: () => void;
  onSaveNoteTag?: (type: 'item'|'subItem', id: string, note: string, tag: string|null, isContinuous?: boolean, isRecurring?: boolean, parentId?: string) => void;
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
  onSaveNoteTag,
}) => {
  const [noteEditor, setNoteEditor] = useState<{
    open: boolean;
    type: 'item'|'subItem';
    id: string;
    parentId?: string;
    note: string;
    tag: string|null;
    isContinuous: boolean;
    isRecurring: boolean;
  }>({
    open: false,
    type: 'item',
    id: "",
    parentId: undefined,
    note: "",
    tag: null,
    isContinuous: false,
    isRecurring: false,
  });

  // Open note/tag editor for item or subItem
  const handleEditNoteTag = (
    type: 'item'|'subItem',
    id: string,
    currentNote: string,
    currentTag: string|null,
    parentId?: string,
    isContinuous: boolean = false,
    isRecurring: boolean = false
  ) => {
    setNoteEditor({
      open: true,
      type,
      id,
      parentId,
      note: currentNote,
      tag: currentTag ?? "",
      isContinuous,
      isRecurring,
    });
  };

  const handleSaveNoteTag = (note: string, tag: string|null, isContinuous: boolean, isRecurring: boolean) => {
    if (noteEditor.type === 'item') {
      onSaveNoteTag && onSaveNoteTag('item', noteEditor.id, note, tag, isContinuous, isRecurring);
    } else if (noteEditor.type === 'subItem' && noteEditor.parentId) {
      onSaveNoteTag && onSaveNoteTag('subItem', noteEditor.id, note, tag, false, false, noteEditor.parentId);
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
          <BudgetItemComponent
            key={item.id}
            item={item}
            isOpen={showSubItems[item.id]}
            onToggle={() => onToggleSubItems(item.id)}
            onDelete={onDeleteItem}
            onAddSubItem={onAddSubItem}
            onDeleteSubItem={onDeleteSubItem}
            onSetDeadline={onSetDeadline}
            onEditNoteTag={(type, id, note, tag, parentId) => 
              handleEditNoteTag(
                type, 
                id, 
                note, 
                tag, 
                parentId,
                type === 'item' ? item.isContinuous || false : false,
                type === 'item' ? item.isRecurring || false : false
              )
            }
          />
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
          initialIsContinuous={noteEditor.isContinuous}
          initialIsRecurring={noteEditor.isRecurring}
          isSubItem={noteEditor.type === 'subItem'}
          onClose={() => setNoteEditor({ ...noteEditor, open: false })}
          onSave={handleSaveNoteTag}
        />
      )}
    </div>
  );
};

export default BudgetItemsList;
