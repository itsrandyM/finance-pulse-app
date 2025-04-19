
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useBudget } from '@/contexts/BudgetContext';
import { useToast } from '@/components/ui/use-toast';
import { PieChart } from '@/components/ui/piechart';
import { DollarSign } from 'lucide-react';

const ExpenseTracking: React.FC = () => {
  const { 
    budgetItems, 
    totalBudget, 
    addExpense, 
    getTotalSpent,
    getRemainingBudget
  } = useBudget();
  const { toast } = useToast();
  
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      toast({
        title: "No Category Selected",
        description: "Please select a budget category.",
        variant: "destructive"
      });
      return;
    }
    
    const numericAmount = parseFloat(expenseAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive"
      });
      return;
    }
    
    addExpense(selectedItemId, numericAmount);
    setExpenseAmount('');
    
    toast({
      title: "Expense Added",
      description: `$${numericAmount.toFixed(2)} expense recorded.`,
    });
  };

  const totalSpent = getTotalSpent();
  const remainingBudget = getRemainingBudget();
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Preparing data for pie chart
  const chartData = budgetItems.map(item => ({
    name: item.name,
    value: item.amount,
  }));

  // Calculate progress for each budget item
  const calculateProgress = (spent: number, budgeted: number) => {
    return (spent / budgeted) * 100;
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage < 70) return 'bg-finance-accent';
    if (percentage < 90) return 'bg-finance-warning';
    return 'bg-finance-danger';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-finance-text">Budget Summary</CardTitle>
          <CardDescription>
            Total Budget: {formatCurrency(totalBudget)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spent: {formatCurrency(totalSpent)}</span>
              <span className={remainingBudget < 0 ? "text-finance-danger" : "text-finance-accent"}>
                Remaining: {formatCurrency(remainingBudget)}
              </span>
            </div>
            <Progress 
              value={spentPercentage > 100 ? 100 : spentPercentage} 
              className={`h-2 ${spentPercentage > 90 ? 'bg-finance-danger' : spentPercentage > 70 ? 'bg-finance-warning' : 'bg-finance-accent'}`} 
            />
          </div>

          {budgetItems.length > 0 && (
            <div className="mt-6">
              <div className="aspect-square max-w-xs mx-auto">
                <PieChart
                  data={chartData}
                  index="name"
                  categories={['value']}
                  valueFormatter={(value) => formatCurrency(value as number)}
                  colors={['#3b82f6', '#0ea5e9', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899']}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-finance-text">Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget-category">Budget Category</Label>
                <Select
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <SelectTrigger id="budget-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Expense Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary"
              disabled={!selectedItemId || !expenseAmount}
            >
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>

      {budgetItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-finance-text">Spending Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetItems.map((item) => {
                const progressPercent = calculateProgress(item.spent, item.amount);
                const progressColorClass = getProgressColor(item.spent, item.amount);
                
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm">
                        <span className={item.spent > item.amount ? "text-finance-danger" : ""}>
                          {formatCurrency(item.spent)}
                        </span>
                        <span className="text-gray-500"> / {formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${progressPercent > 100 ? 100 : progressPercent}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColorClass}`}
                        ></div>
                      </div>
                    </div>
                    {item.spent > item.amount && (
                      <div className="text-xs text-finance-danger">
                        Over budget by {formatCurrency(item.spent - item.amount)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {budgetItems.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium text-gray-500">No Budget Items</h3>
              <p className="text-sm text-gray-400">
                You need to create budget items before you can track expenses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseTracking;
