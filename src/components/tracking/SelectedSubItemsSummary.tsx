
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { Calculator } from 'lucide-react';

interface SubItemAmount {
  id: string;
  amount: number;
}

interface SelectedSubItemsSummaryProps {
  selectedSubItems: SubItemAmount[];
}

const SelectedSubItemsSummary: React.FC<SelectedSubItemsSummaryProps> = ({
  selectedSubItems
}) => {
  const getTotalSelectedAmount = () => {
    return selectedSubItems.reduce((total, item) => total + item.amount, 0);
  };

  if (selectedSubItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Calculator className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-700">
        Total selected: {formatCurrency(getTotalSelectedAmount())}
      </span>
      <span className="text-xs text-blue-600">
        ({selectedSubItems.length} item{selectedSubItems.length !== 1 ? 's' : ''})
      </span>
    </div>
  );
};

export default SelectedSubItemsSummary;
