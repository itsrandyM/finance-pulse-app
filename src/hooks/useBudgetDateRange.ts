
import { BudgetPeriod, BudgetDateRange } from '@/types/budget';

export const useBudgetDateRange = () => {
  const calculateDateRange = (startDate: Date, budgetPeriod: BudgetPeriod): BudgetDateRange => {
    const endDate = new Date(startDate);
    
    switch (budgetPeriod) {
      case 'daily':
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'bi-weekly':
        endDate.setDate(startDate.getDate() + 14);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'semi-annually':
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      case 'annually':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
      default:
        endDate.setDate(startDate.getDate() + 30);
    }
    
    return { startDate, endDate };
  };

  return { calculateDateRange };
};
