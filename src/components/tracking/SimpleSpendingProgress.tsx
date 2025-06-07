
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BudgetItem } from '@/types/budget';

interface SimpleSpendingProgressProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const SimpleSpendingProgress: React.FC<SimpleSpendingProgressProps> = ({
  budgetItems,
  formatCurrency,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

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
            const isExpanded = expandedItems.has(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;

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
                      {hasSubItems && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(item.id)}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
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

                {hasSubItems && isExpanded && (
                  <div className="ml-4 mt-3 p-3 bg-gray-50 rounded-lg border-l-2 border-blue-200">
                    <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">
                      Sub-categories:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {item.subItems.map((subItem) => (
                        <div key={subItem.id} className="flex justify-between items-center p-2 bg-white rounded border shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-sm font-medium">{subItem.name}</span>
                            {subItem.tag && (
                              <Badge variant="outline" className="text-xs">
                                {subItem.tag}
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
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
