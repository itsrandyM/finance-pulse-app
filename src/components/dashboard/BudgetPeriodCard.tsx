
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, PlusCircle } from 'lucide-react';
import { BudgetPeriod, BudgetDateRange } from '@/types/budget';

interface BudgetPeriodCardProps {
  period: BudgetPeriod;
  budgetDateRange: BudgetDateRange;
  onShowIncomeDialog: () => void;
  onShowCreateDialog: () => void;
}

const BudgetPeriodCard: React.FC<BudgetPeriodCardProps> = ({
  period,
  budgetDateRange,
  onShowIncomeDialog,
  onShowCreateDialog
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <CardTitle className="text-base md:text-lg text-blue-900 capitalize">
              Current {period} Budget Period
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              onClick={onShowIncomeDialog}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100 w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Income
            </Button>
            <Button 
              onClick={onShowCreateDialog}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Budget
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm text-blue-700">
          <span><strong>Start:</strong> {formatDate(budgetDateRange.startDate)}</span>
          <span className="hidden sm:inline">•</span>
          <span><strong>End:</strong> {formatDate(budgetDateRange.endDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetPeriodCard;
