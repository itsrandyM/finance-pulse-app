
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/formatters';

interface DuplicateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  amount: number;
}

export const DuplicateExpenseDialog: React.FC<DuplicateExpenseDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  amount,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Budget Exceeded - Multiple Expenses Detected</AlertDialogTitle>
          <AlertDialogDescription>
            You're about to add another expense of{' '}
            <span className="font-semibold">{formatCurrency(amount)}</span> to "
            {itemName}", which will exceed its allocated budget.
            <br /><br />
            This item was previously tracked and this additional expense would put you over budget. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Yes, Add Expense
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
