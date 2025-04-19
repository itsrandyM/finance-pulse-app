
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BudgetItem } from '@/contexts/BudgetContext';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { PieChart } from '@/components/ui/piechart';

interface SpendingProgressCardProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const SpendingProgressCard: React.FC<SpendingProgressCardProps> = ({
  budgetItems,
  formatCurrency,
}) => {
  const calculateProgress = (spent: number, budgeted: number) => {
    return (spent / budgeted) * 100;
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage < 70) return 'bg-finance-accent';
    if (percentage < 90) return 'bg-finance-warning';
    return 'bg-finance-danger';
  };

  // Prepare data for pie chart
  const chartData = budgetItems.map(item => ({
    name: item.name,
    value: item.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-finance-text">Spending Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart Section */}
        <div className="mb-8 aspect-square max-w-xs mx-auto">
          <PieChart
            data={chartData}
            index="name"
            categories={['value']}
            valueFormatter={formatCurrency}
            colors={['#3b82f6', '#0ea5e9', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899']}
            className="h-full"
          />
        </div>

        {/* Progress Bars Section */}
        <div className="space-y-6">
          {budgetItems.map((item) => {
            const progressPercent = calculateProgress(item.spent, item.amount);
            const progressColorClass = getProgressColor(item.spent, item.amount);
            const isOverBudget = item.spent > item.amount;
            
            return (
              <Collapsible key={item.id}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:text-finance-accent">
                      <ChevronDown className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                    </CollapsibleTrigger>
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

                  <CollapsibleContent>
                    {item.subItems.length > 0 ? (
                      <div className="pl-6 mt-2 space-y-2">
                        {item.subItems.map((subItem) => (
                          <div 
                            key={subItem.id} 
                            className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                          >
                            <span>{subItem.name}</span>
                            <span className="text-gray-600">{formatCurrency(subItem.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-6 mt-2 text-sm text-gray-500">
                        No sub-items added
                      </div>
                    )}
                  </CollapsibleContent>
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
