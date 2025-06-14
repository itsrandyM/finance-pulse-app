
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import * as expenseService from '@/services/expenseService';
import { format } from 'date-fns';

interface Expense {
  id: string;
  amount: number;
  created_at: string;
  budget_item_id: string;
  sub_item_id?: string;
  budget_item_name?: string;
  sub_item_name?: string;
}

const ExpenseHistoryPage: React.FC = () => {
  const { budgetItems, currentBudgetId } = useBudget();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    loadExpenseHistory();
  }, [currentBudgetId, budgetItems]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory, sortBy]);

  const loadExpenseHistory = async () => {
    if (!currentBudgetId || budgetItems.length === 0) return;
    
    try {
      setIsLoading(true);
      const allExpenses: Expense[] = [];
      
      for (const item of budgetItems) {
        const itemExpenses = await expenseService.getExpensesByItem(item.id);
        const enhancedExpenses = itemExpenses.map(expense => ({
          ...expense,
          budget_item_name: item.name,
          sub_item_name: expense.sub_item_id 
            ? item.subItems.find(sub => sub.id === expense.sub_item_id)?.name 
            : undefined
        }));
        allExpenses.push(...enhancedExpenses);
      }
      
      setExpenses(allExpenses);
    } catch (error: any) {
      toast({
        title: "Error loading expense history",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.budget_item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.sub_item_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.budget_item_id === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    setFilteredExpenses(filtered);
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-finance-primary mx-auto mb-4"></div>
            <p>Loading expense history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Expense History</h1>
        <p className="text-muted-foreground">Track and analyze your spending patterns</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {budgetItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'date' | 'amount') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (newest first)</SelectItem>
                <SelectItem value="amount">Amount (highest first)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalExpenses())}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Number of Expenses</p>
                <p className="text-2xl font-bold">{filteredExpenses.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Expense</p>
                <p className="text-2xl font-bold">
                  {filteredExpenses.length > 0 
                    ? formatCurrency(getTotalExpenses() / filteredExpenses.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expenses found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{expense.budget_item_name}</h3>
                      {expense.sub_item_name && (
                        <span className="text-sm text-muted-foreground">
                          → {expense.sub_item_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(expense.created_at), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseHistoryPage;
