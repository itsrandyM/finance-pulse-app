import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import * as incomeService from '@/services/incomeService';
import { formatCurrency } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import CarryOverItemsEditor from '@/components/budget/CarryOverItemsEditor';
import { BudgetItem } from '@/types/budget';

const IncomeSetupPage: React.FC = () => {
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeEntries, setIncomeEntries] = useState<incomeService.IncomeEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [carryOverItems, setCarryOverItems] = useState<BudgetItem[]>([]);
  const [carryOverBudget, setCarryOverBudget] = useState(0);
  const { toast } = useToast();
  const { 
    period, 
    previousRemainingBudget, 
    continuousBudgetItems,
    setPreviousRemainingBudget,
    setContinuousBudgetItems
  } = useBudget();
  const navigate = useNavigate();
  
  // Check if we have a budget period selected
  useEffect(() => {
    if (!period) {
      navigate('/');
    }
  }, [period, navigate]);

  // Initialize carry-over data
  useEffect(() => {
    if (previousRemainingBudget > 0 || continuousBudgetItems.length > 0) {
      setCarryOverBudget(previousRemainingBudget);
      // Create copies of items with unique IDs for editing
      const itemsToEdit = continuousBudgetItems.map(item => ({
        ...item,
        id: `temp-${item.id}-${Date.now()}` // Temporary ID for editing
      }));
      setCarryOverItems(itemsToEdit);
    }
  }, [previousRemainingBudget, continuousBudgetItems]);
  
  // Load existing income entries
  useEffect(() => {
    const fetchIncomeEntries = async () => {
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
    
    fetchIncomeEntries();
  }, [toast]);
  
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incomeName.trim()) {
      toast({
        title: "Income name required",
        description: "Please enter a name for your income",
        variant: "destructive"
      });
      return;
    }

    if (!incomeAmount || parseFloat(incomeAmount) <= 0) {
      toast({
        title: "Valid amount required",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await incomeService.createIncomeEntry(incomeName, parseFloat(incomeAmount));
      toast({
        title: "Income added",
        description: `${incomeName} added successfully`,
      });
      setIncomeName('');
      setIncomeAmount('');
      
      // Reload income entries
      const entries = await incomeService.getIncomeEntries();
      setIncomeEntries(entries);
      const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      setTotalIncome(total);
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
      
      // Reload income entries
      const entries = await incomeService.getIncomeEntries();
      setIncomeEntries(entries);
      const total = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      setTotalIncome(total);
      
      toast({
        title: "Income deleted",
        description: "Income entry removed successfully",
      });
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
  
  const handleCarryOverItemsUpdate = (updatedItems: BudgetItem[]) => {
    setCarryOverItems(updatedItems);
    // Update the context with the edited items (restore original IDs)
    const itemsWithOriginalIds = updatedItems.map(item => ({
      ...item,
      id: item.id.startsWith('temp-') ? item.id.split('-')[1] : item.id
    }));
    setContinuousBudgetItems(itemsWithOriginalIds);
  };

  const handleCarryOverBudgetUpdate = (amount: number) => {
    setCarryOverBudget(amount);
    setPreviousRemainingBudget(amount);
  };
  
  const handleContinue = () => {
    navigate('/budget-amount');
  };
  
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Income Setup</h1>
      </div>

      {/* Carry Over Items Editor */}
      <CarryOverItemsEditor
        items={carryOverItems}
        remainingBudget={carryOverBudget}
        onItemsUpdate={handleCarryOverItemsUpdate}
        onRemainingBudgetUpdate={handleCarryOverBudgetUpdate}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Income</CardTitle>
            <CardDescription>
              Enter your income sources for this {period} budget period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incomeName">Income Source</Label>
                <Input
                  id="incomeName"
                  placeholder="Salary, Freelancing, etc."
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incomeAmount">Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">KSh</span>
                  </div>
                  <Input
                    id="incomeAmount"
                    className="pl-12"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner variant="spinner" size="sm" theme="light" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Income Summary</CardTitle>
            <CardDescription>
              Your total income: {formatCurrency(totalIncome)}
              {carryOverBudget > 0 && (
                <span className="block text-sm text-blue-600 mt-1">
                  + {formatCurrency(carryOverBudget)} carried over from previous budget
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && incomeEntries.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner variant="dots" size="md" theme="finance" />
              </div>
            ) : incomeEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No income entries yet. Add your income sources to continue.
              </p>
            ) : (
              <div className="space-y-4">
                {incomeEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(entry.amount)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-finance-danger h-8 w-8 p-0"
                        onClick={() => handleDeleteIncome(entry.id)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleContinue} 
              className="w-full bg-finance-primary"
            >
              Continue to Budget Amount
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default IncomeSetupPage;
