
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';

interface SimpleAnalyticsDashboardProps {
  budgetItems: BudgetItem[];
  totalBudget: number;
  formatCurrency: (amount: number) => string;
}

const SimpleAnalyticsDashboard: React.FC<SimpleAnalyticsDashboardProps> = ({
  budgetItems,
  totalBudget,
  formatCurrency: formatCurrencyProp
}) => {
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const unallocatedBudget = totalBudget - totalAllocated;

  // Prepare data for charts
  const spendingData = budgetItems
    .filter(item => item.spent > 0)
    .map(item => ({
      name: item.name,
      spent: item.spent,
      budget: item.amount,
      percentage: item.amount > 0 ? (item.spent / item.amount) * 100 : 0
    }))
    .sort((a, b) => b.spent - a.spent);

  const categoryBreakdown = [
    { name: 'Spent', value: totalSpent, color: '#ef4444' },
    { name: 'Remaining', value: Math.max(0, remainingBudget), color: '#22c55e' },
    { name: 'Unallocated', value: Math.max(0, unallocatedBudget), color: '#94a3b8' }
  ].filter(item => item.value > 0);

  const getSpendingTrend = (item: BudgetItem) => {
    const percentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
    if (percentage > 90) return 'danger';
    if (percentage > 75) return 'warning';
    return 'good';
  };

  const onTrackItems = budgetItems.filter(item => {
    const percentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
    return percentage <= 75;
  }).length;

  const overBudgetItems = budgetItems.filter(item => item.spent > item.amount).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">
                  {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items On Track</p>
                <p className="text-2xl font-bold text-green-600">{onTrackItems}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Over Budget</p>
                <p className="text-2xl font-bold text-red-600">{overBudgetItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Spending</p>
                <p className="text-2xl font-bold">
                  {budgetItems.length > 0 
                    ? formatCurrencyProp(totalSpent / budgetItems.length)
                    : formatCurrencyProp(0)
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrencyProp(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrencyProp(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData.slice(0, 6)}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={formatCurrencyProp}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrencyProp(value as number),
                      name === 'spent' ? 'Spent' : 'Budget'
                    ]}
                  />
                  <Bar dataKey="budget" fill="#e2e8f0" name="budget" />
                  <Bar dataKey="spent" fill="#3b82f6" name="spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetItems.map(item => {
              const percentage = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
              const trend = getSpendingTrend(item);
              
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {trend === 'danger' && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      {trend === 'warning' && (
                        <TrendingDown className="h-4 w-4 text-yellow-500" />
                      )}
                      {trend === 'good' && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm">
                        {formatCurrencyProp(item.spent)} / {formatCurrencyProp(item.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAnalyticsDashboard;
