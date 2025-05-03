
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import * as incomeService from '@/services/incomeService';
import { useBudget } from '@/contexts/BudgetContext';

const IncomeTracking: React.FC = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeEntries, setIncomeEntries] = useState<incomeService.IncomeEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { totalBudget } = useBudget();

  // Load income entries
  const loadIncomeEntries = async () => {
    setIsLoading(true);
    try {
      const entries = await incomeService.getIncomeEntries();
      setIncomeEntries(entries);
      const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      setTotalIncome(total);
    } catch (error) {
      toast({
        title: "Failed to load income entries",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncomeEntries();
  }, []);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Income name required",
        description: "Please enter a name for your income",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Valid amount required",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await incomeService.createIncomeEntry(name, parseFloat(amount));
      toast({
        title: "Income added",
        description: `${name} added successfully`,
      });
      setName('');
      setAmount('');
      loadIncomeEntries();
    } catch (error) {
      toast({
        title: "Failed to add income",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    setIsLoading(true);
    try {
      await incomeService.deleteIncomeEntry(id);
      toast({
        title: "Income deleted",
        description: "Income entry removed successfully",
      });
      loadIncomeEntries();
    } catch (error) {
      toast({
        title: "Failed to delete income",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Income Tracking</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Income</CardTitle>
          <CardDescription>Track your income sources</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddIncome} className="flex flex-col gap-4">
            <div>
              <Input
                placeholder="Income Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Summary</CardTitle>
          <CardDescription>
            Total Income: {formatCurrency(totalIncome)} | Total Budget: {formatCurrency(totalBudget)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incomeEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No income entries yet</p>
            ) : (
              incomeEntries.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{formatCurrency(entry.amount)}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteIncome(entry.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-finance-danger" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-xl font-bold text-finance-primary">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="border rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="col-span-2 border rounded-md p-4 text-center bg-finance-accent/10">
              <p className="text-sm text-muted-foreground">Combined Total</p>
              <p className="text-2xl font-bold text-finance-accent">{formatCurrency(totalIncome + totalBudget)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTracking;
