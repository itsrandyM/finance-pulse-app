
import { useState, useEffect } from 'react';
import { BudgetItem } from '@/types/budget';
import { useToast } from '@/hooks/use-toast';

interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  itemId: string;
  percentage: number;
}

interface UseBudgetAlertsProps {
  budgetItems: BudgetItem[];
  totalBudget: number;
  getTotalSpent: () => number;
  getRemainingBudget: () => number;
}

export const useBudgetAlerts = ({
  budgetItems,
  totalBudget,
  getTotalSpent,
  getRemainingBudget
}: UseBudgetAlertsProps) => {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkForAlerts();
  }, [budgetItems, totalBudget]);

  const checkForAlerts = () => {
    const newAlerts: BudgetAlert[] = [];

    // Check individual budget items
    budgetItems.forEach(item => {
      const spentPercentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
      
      if (spentPercentage >= 100) {
        newAlerts.push({
          id: `${item.id}-exceeded`,
          type: 'danger',
          title: 'Budget Exceeded',
          message: `You've exceeded your budget for "${item.name}" by ${((item.spent - item.amount) / item.amount * 100).toFixed(1)}%`,
          itemId: item.id,
          percentage: spentPercentage
        });
      } else if (spentPercentage >= 90) {
        newAlerts.push({
          id: `${item.id}-critical`,
          type: 'danger',
          title: 'Critical Budget Alert',
          message: `You've used ${spentPercentage.toFixed(1)}% of your budget for "${item.name}"`,
          itemId: item.id,
          percentage: spentPercentage
        });
      } else if (spentPercentage >= 75) {
        newAlerts.push({
          id: `${item.id}-warning`,
          type: 'warning',
          title: 'Budget Warning',
          message: `You've used ${spentPercentage.toFixed(1)}% of your budget for "${item.name}"`,
          itemId: item.id,
          percentage: spentPercentage
        });
      }

      // Check for deadline alerts
      if (item.deadline) {
        const daysUntilDeadline = Math.ceil((item.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline <= 3 && daysUntilDeadline > 0 && spentPercentage < 50) {
          newAlerts.push({
            id: `${item.id}-deadline`,
            type: 'info',
            title: 'Deadline Approaching',
            message: `"${item.name}" deadline is in ${daysUntilDeadline} day(s) and you've only used ${spentPercentage.toFixed(1)}% of the budget`,
            itemId: item.id,
            percentage: spentPercentage
          });
        }
      }
    });

    // Check overall budget
    const totalSpentPercentage = totalBudget > 0 ? (getTotalSpent() / totalBudget) * 100 : 0;
    
    if (totalSpentPercentage >= 95) {
      newAlerts.push({
        id: 'total-critical',
        type: 'danger',
        title: 'Total Budget Critical',
        message: `You've used ${totalSpentPercentage.toFixed(1)}% of your total budget`,
        itemId: 'total',
        percentage: totalSpentPercentage
      });
    } else if (totalSpentPercentage >= 80) {
      newAlerts.push({
        id: 'total-warning',
        type: 'warning',
        title: 'Total Budget Warning',
        message: `You've used ${totalSpentPercentage.toFixed(1)}% of your total budget`,
        itemId: 'total',
        percentage: totalSpentPercentage
      });
    }

    // Show toast for new critical alerts
    const criticalAlerts = newAlerts.filter(alert => alert.type === 'danger');
    criticalAlerts.forEach(alert => {
      // Only show toast if this is a new alert (simplified check)
      const existingAlert = alerts.find(existing => existing.id === alert.id);
      if (!existingAlert) {
        toast({
          title: alert.title,
          description: alert.message,
          variant: "destructive"
        });
      }
    });

    setAlerts(newAlerts);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertsForItem = (itemId: string) => {
    return alerts.filter(alert => alert.itemId === itemId);
  };

  return {
    alerts,
    dismissAlert,
    getAlertsForItem,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(alert => alert.type === 'danger').length,
    warningAlerts: alerts.filter(alert => alert.type === 'warning').length
  };
};
