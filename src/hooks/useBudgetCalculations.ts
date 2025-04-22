
import { BudgetItem } from '@/types/budget';

interface UseBudgetCalculationsProps {
  budgetItems: BudgetItem[];
  totalBudget: number;
}

export const useBudgetCalculations = ({
  budgetItems,
  totalBudget
}: UseBudgetCalculationsProps) => {
  
  const getTotalAllocated = () => {
    return budgetItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalSpent = () => {
    return budgetItems.reduce((sum, item) => sum + item.spent, 0);
  };

  const getRemainingBudget = () => {
    return totalBudget - getTotalSpent();
  };

  return {
    getTotalAllocated,
    getTotalSpent,
    getRemainingBudget
  };
};
