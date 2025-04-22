
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BudgetItem } from '@/contexts/BudgetContext';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import * as budgetService from '@/services/budgetService';

interface SpendingProgressCardProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const SpendingProgressCard: React.FC<SpendingProgressCardProps> = ({
  budgetItems,
  formatCurrency,
}) => {
  const [trackedSubItems, setTrackedSubItems] = useState<Record<string, boolean>>({});
  
  // Fetch expenses for all sub-items to determine which ones have been tracked
  useEffect(() => {
    const fetchSubItemExpenses = async () => {
      const subItemExpensesMap: Record<string, boolean> = {};
      
      for (const item of budgetItems) {
        for (const subItem of item.subItems) {
          try {
            const expenses = await budgetService.getExpensesBySubItem(subItem.id);
            subItemExpensesMap[subItem.id] = expenses.length > 0;
          } catch (error) {
            console.error(`Error fetching expenses for sub-item ${subItem.id}:`, error);
          }
        }
      }
      
      setTrackedSubItems(subItemExpensesMap);
    };
    
    if (budgetItems.length > 0) {
      fetchSubItemExpenses();
    }
  }, [budgetItems]);

  const calculateProgress = (spent: number, budgeted: number) => {
    return budgeted > 0 ? (spent / budgeted) * 100 : 0;
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
    if (percentage < 70) return 'bg-finance-accent';
    if (percentage < 90) return 'bg-finance-warning';
    return 'bg-finance-danger';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Spending Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetItems.map((item) => {
            const progressPercent = calculateProgress(item.spent, item.amount);
            const progressColorClass = getProgressColor(item.spent, item.amount);
            const isOverBudget = item.spent > item.amount;
            const hasSubItems = item.subItems.length > 0;
            
            return (
              <Collapsible key={item.id}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    {hasSubItems ? (
                      <CollapsibleTrigger className="flex items-center gap-2 hover:text-finance-accent">
                        <ChevronDown className="h-4 w-4" />
                        <span className="font-medium">{item.name}</span>
                      </CollapsibleTrigger>
                    ) : (
                      <span className="font-medium pl-6">{item.name}</span>
                    )}
                    <div className="text-sm">
                      <span className={isOverBudget ? "text-finance-danger" : ""}>
                        {formatCurrency(item.spent)}
                      </span>
                      <span className="text-gray-500"> / {formatCurrency(item.amount)}</span>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${progressPercent > 100 ? 100 : progressPercent}%` }}
                        className={cn(
                          "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center",
                          progressColorClass
                        )}
                      ></div>
                    </div>
                  </div>

                  {isOverBudget && (
                    <div className="text-xs text-finance-danger">
                      Over budget by {formatCurrency(item.spent - item.amount)}
                    </div>
                  )}

                  {hasSubItems && (
                    <CollapsibleContent>
                      <div className="pl-6 mt-2 space-y-2">
                        {item.subItems.map((subItem) => {
                          const isTracked = trackedSubItems[subItem.id] || subItem.hasExpenses;
                          
                          return (
                            <div 
                              key={subItem.id} 
                              className={cn(
                                "flex justify-between items-center text-sm p-2 rounded",
                                isTracked ? "bg-green-50 border border-green-100" : "bg-gray-50"
                              )}
                            >
                              <span className={isTracked ? "font-medium text-green-700" : ""}>
                                {subItem.name}
                                {isTracked && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Tracked
                                  </span>
                                )}
                              </span>
                              <span className={isTracked ? "text-green-700" : "text-gray-600"}>
                                {formatCurrency(subItem.amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingProgressCard;
