
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';

interface BudgetAllocationSummaryProps {
  totalBudget: number;
  totalAllocated: number;
  remainingToAllocate: number;
}

const BudgetAllocationSummary: React.FC<BudgetAllocationSummaryProps> = ({
  totalBudget,
  totalAllocated,
  remainingToAllocate,
}) => {
  const allocationPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Overview</h2>
          <p className="text-lg text-gray-600">Total Budget: {formatCurrency(totalBudget)}</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">
              Allocated: {formatCurrency(totalAllocated)}
            </div>
            <div className={`text-lg font-bold ${remainingToAllocate < 0 ? "text-red-600" : "text-green-600"}`}>
              Remaining: {formatCurrency(remainingToAllocate)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Progress</span>
          <span>{allocationPercentage.toFixed(1)}%</span>
        </div>
        <Progress 
          value={allocationPercentage} 
          className="h-3 bg-white/50 border border-blue-200" 
        />
      </div>
    </div>
  );
};

export default BudgetAllocationSummary;
