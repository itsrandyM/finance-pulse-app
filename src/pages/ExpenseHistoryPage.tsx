import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, DollarSign, History } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import * as expenseService from '@/services/expenseService';
import * as budgetItemService from '@/services/budgetItemService';
import { format } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

  const [viewMode, setViewMode] = useState<'current' | 'recurring'>('current');
  const [recurringHistory, setRecurringHistory] = useState<Expense[]>([]);
  const [isRecurringLoading, setIsRecurringLoading] = useState(false);
  const [selectedRecurringItem, setSelectedRecurringItem] = useState<string>('');
  
  const recurringItems = useMemo(() => {
    return Array.from(new Set(budgetItems.filter(item => item.isRecurring).map(item => item.name)));
  }, [budgetItems]);

  useEffect(() => {
    if (viewMode === 'current') {
      loadExpenseHistory();
    }
  }, [currentBudgetId, budgetItems, viewMode]);

  useEffect(() => {
    if (recurringItems.length > 0 && !selectedRecurringItem) {
      setSelectedRecurringItem(recurringItems[0]);
    }
  }, [recurringItems, selectedRecurringItem]);

  useEffect(() => {
    if (viewMode === 'recurring' && selectedRecurringItem) {
      loadRecurringHistory();
    }
  }, [viewMode, selectedRecurringItem]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory, sortBy]);

  const loadExpenseHistory = async () => {
    if (!currentBudgetId || budgetItems.length === 0) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const allExpenses: Expense[] = [];
      
      const itemExpensesPromises = budgetItems.map(async (item) => {
        const itemExpenses = await expenseService.getExpensesByItem(item.id);
        return itemExpenses.map(expense => ({
          ...expense,
          budget_item_name: item.name,
          sub_item_name: expense.sub_item_id 
            ? item.subItems.find(sub => sub.id === expense.sub_item_id)?.name 
            : undefined
        }));
      });

      const results = await Promise.all(itemExpensesPromises);
      results.forEach(result => allExpenses.push(...result));
      
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

  const loadRecurringHistory = async () => {
    if (!selectedRecurringItem) return;
    setIsRecurringLoading(true);
    try {
      const history = await budgetItemService.getExpensesForRecurringItem(selectedRecurringItem);
      setRecurringHistory(history as Expense[]);
    } catch (error: any) {
      toast({
        title: "Error loading recurring item history",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRecurringLoading(false);
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

  const getTotalExpenses = (source: Expense[]) => {
    return source.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const renderExpenseList = (expenseList: Expense[], title: string, emptyMessage: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {expenseList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenseList.map((expense) => (
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
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner />
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

      <div className="flex justify-center mb-6">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if(value) setViewMode(value as 'current' | 'recurring')}}>
          <ToggleGroupItem value="current" aria-label="Current period expenses">
            <Calendar className="h-4 w-4 mr-2"/>
            Current Period
          </ToggleGroupItem>
          <ToggleGroupItem value="recurring" aria-label="Recurring item history">
            <History className="h-4 w-4 mr-2"/>
            Recurring History
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {viewMode === 'current' && (
        <>
          {isLoading ? (
             <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <LoadingSpinner />
                    <p>Loading expense history...</p>
                </div>
            </div>
          ) : (
            <>
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

              {renderExpenseList(filteredExpenses, "Recent Expenses", "No expenses found matching your criteria.")}
            </>
          )}
        </>
      )}

      {viewMode === 'recurring' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Select Recurring Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recurringItems.length > 0 ? (
                <Select value={selectedRecurringItem} onValueChange={setSelectedRecurringItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurringItems.map(item => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">No recurring items found in the current budget.</p>
              )}
            </CardContent>
          </Card>

          {isRecurringLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <LoadingSpinner />
                    <p>Loading recurring history for {selectedRecurringItem}...</p>
                </div>
            </div>
          ) : (
            recurringItems.length > 0 && renderExpenseList(recurringHistory, `All expenses for "${selectedRecurringItem}"`, `No expense history found for "${selectedRecurringItem}".`)
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseHistoryPage;
