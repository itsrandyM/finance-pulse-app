
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

interface QuickAmountButtonsProps {
  onSelectAmount: (amount: number) => void;
  isLoading: boolean;
}

const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({
  onSelectAmount,
  isLoading
}) => {
  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-600">Quick amounts:</div>
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map(quickAmount => (
          <Button
            key={quickAmount}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectAmount(quickAmount)}
            disabled={isLoading}
            className="text-xs px-3 py-1 h-8 flex-shrink-0"
          >
            {formatCurrency(quickAmount)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickAmountButtons;
