
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatters';
import { Calendar, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

interface BudgetHistoryCardProps {
  budget: {
    id: string;
    period: string;
    total_budget: number;
    created_at: string;
    end_date: string;
    total_spent: number;
    status?: string;
    utilization_percentage?: number;
    total_transactions?: number;
    actual_end_date?: string;
  };
  onClick?: (budgetId: string) => void;
}

const BudgetHistoryCard: React.FC<BudgetHistoryCardProps> = ({ budget, onClick }) => {
  const utilizationPercentage = budget.utilization_percentage || 
    (budget.total_budget > 0 ? (budget.total_spent / budget.total_budget) * 100 : 0);
  
  const remaining = budget.total_budget - budget.total_spent;
  const isOverBudget = remaining < 0;
  
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-500', text: 'Completed', icon: Target };
      case 'abandoned':
        return { color: 'bg-gray-500', text: 'Abandoned', icon: Clock };
      case 'overspent':
        return { color: 'bg-red-500', text: 'Overspent', icon: TrendingUp };
      case 'interrupted':
        return { color: 'bg-yellow-500', text: 'Interrupted', icon: TrendingDown };
      case 'active':
        return { color: 'bg-blue-500', text: 'Active', icon: Target };
      default:
        return { color: 'bg-gray-400', text: 'Unknown', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(budget.status);
  const StatusIcon = statusConfig.icon;

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Ksh ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Ksh ${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${onClick ? 'hover:scale-[1.02]' : ''}`}
      onClick={() => onClick?.(budget.id)}
    >
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg capitalize">
            {budget.period} Budget
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${statusConfig.color} text-white text-xs px-2 py-1 flex items-center gap-1`}
          >
            <StatusIcon className="h-3 w-3" />
            <span className="hidden sm:inline">{statusConfig.text}</span>
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="truncate">
            {format(new Date(budget.created_at), 'MMM dd')} - {format(new Date(budget.end_date), 'MMM dd, yyyy')}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-semibold text-sm sm:text-base truncate" title={formatCurrency(budget.total_budget)}>
              {formatCompactCurrency(budget.total_budget)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="font-semibold text-sm sm:text-base truncate" title={formatCurrency(budget.total_spent)}>
              {formatCompactCurrency(budget.total_spent)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {utilizationPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(utilizationPercentage, 100)} 
            className="h-2"
          />
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
          <span>{budget.total_transactions || 0} transactions</span>
          <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600'}>
            {isOverBudget ? 'Over by ' : 'Saved '}
            {formatCompactCurrency(Math.abs(remaining))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetHistoryCard;
