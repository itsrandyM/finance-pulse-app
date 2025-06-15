
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetItem } from '@/types/budget';

interface BudgetCategoriesCardProps {
  budgetItems: BudgetItem[];
}

const BudgetCategoriesCard: React.FC<BudgetCategoriesCardProps> = ({ budgetItems }) => {
  const navigate = useNavigate();

  if (!budgetItems || budgetItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Budget Categories</CardTitle>
        <CardDescription>
          Your {budgetItems.length} budget categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetItems.slice(0, 6).map((item) => {
            const itemSpentPercentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
            return (
              <div key={item.id} className="p-3 border rounded-lg">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-sm text-gray-600">
                  Ksh {item.spent.toLocaleString()} / Ksh {item.amount.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      itemSpentPercentage > 100 ? 'bg-red-500' : 
                      itemSpentPercentage > 80 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(itemSpentPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        {budgetItems.length > 6 && (
          <div className="mt-4 text-center">
            <Button onClick={() => navigate('/budget')} variant="outline" size="sm">
              View All Categories
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetCategoriesCard;
