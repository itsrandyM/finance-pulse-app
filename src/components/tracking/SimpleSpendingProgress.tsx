
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetItem } from '@/types/budget';

interface SimpleSpendingProgressProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const SimpleSpendingProgress: React.FC<SimpleSpendingProgressProps> = ({
  budgetItems,
  formatCurrency,
}) => {
  if (budgetItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No budget items found. Create budget items to track your spending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetItems.map((item) => {
            const progressPercent = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
            const isOverBudget = item.spent > item.amount;
            const remaining = item.amount - item.spent;

            return (
              <div key={item.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.name}</span>
                      {item.isImpulse && (
                        <Badge variant="secondary" className="text-xs">
                          Impulse
                        </Badge>
                      )}
                      {item.isContinuous && (
                        <Badge variant="outline" className="text-xs">
                          Continuous
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(progressPercent, 100)} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs">
                  <span className={`${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget 
                      ? `Over by ${formatCurrency(Math.abs(remaining))}` 
                      : `${formatCurrency(remaining)} remaining`
                    }
                  </span>
                  <span className="text-gray-500">
                    {progressPercent.toFixed(1)}%
                  </span>
                </div>

                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-2 mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Sub-categories:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {item.subItems.map((subItem) => (
                        <div key={subItem.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm border-l-2 border-blue-200">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>{subItem.name}</span>
                            {subItem.tag && (
                              <Badge variant="outline" className="text-xs">
                                {subItem.tag}
                              </Badge>
                            )}
                          </div>
                          <span className="font-medium text-gray-700">
                            {formatCurrency(subItem.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.note && (
                  <div className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                    Note: {item.note}
                  </div>
                )}
                
                {item.deadline && (
                  <div className="text-xs text-orange-600">
                    Deadline: {new Date(item.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleSpendingProgress;
