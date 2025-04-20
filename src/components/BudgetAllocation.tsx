import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '@/contexts/BudgetContext';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import SubItemInput from './budget/SubItemInput';

const BudgetAllocation: React.FC = () => {
  const { 
    totalBudget, 
    budgetItems, 
    addBudgetItem, 
    deleteBudgetItem,
    addSubItem,
    deleteSubItem,
    getTotalAllocated,
    updateItemDeadline
  } = useBudget();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [showSubItems, setShowSubItems] = useState<{ [key: string]: boolean }>({});
  const [selectedItemForDeadline, setSelectedItemForDeadline] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    
    const totalAllocated = getTotalAllocated();
    if (totalAllocated + numericAmount > totalBudget) {
      toast({
        title: "Budget Exceeded",
        description: "This item would exceed your total budget.",
        variant: "destructive"
      });
      return;
    }
    
    addBudgetItem(name, numericAmount, false); // Added the third parameter 'false' for isImpulse
    setName('');
    setAmount('');
  };

  const handleDeleteItem = (id: string) => {
    deleteBudgetItem(id);
  };

  const handleAddSubItem = (budgetItemId: string, name: string, amount: number) => {
    if (amount > 0) {
      addSubItem(budgetItemId, name, amount);
      setShowSubItems(prev => ({ ...prev, [budgetItemId]: false }));
    }
  };

  const totalAllocated = getTotalAllocated();
  const remainingToAllocate = totalBudget - totalAllocated;
  const allocationPercentage = (totalAllocated / totalBudget) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-finance-text">Budget Allocation</CardTitle>
          <CardDescription>
            Total Budget: {formatCurrency(totalBudget)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Allocated: {formatCurrency(totalAllocated)}</span>
              <span className={remainingToAllocate < 0 ? "text-finance-danger" : "text-finance-accent"}>
                Remaining: {formatCurrency(remainingToAllocate)}
              </span>
            </div>
            <Progress value={allocationPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-finance-text">Add Budget Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  placeholder="e.g., Rent, Transport, Food"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-amount">Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    id="item-amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto bg-finance-primary hover:bg-finance-secondary">
              Add Budget Item
            </Button>
          </form>
        </CardContent>
      </Card>

      {budgetItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-finance-text">Budget Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetItems.map((item) => (
                <Collapsible key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.isImpulse && (
                          <span className="px-2 py-1 text-xs bg-finance-warning text-white rounded-full">
                            Impulse
                          </span>
                        )}
                      </div>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSubItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      >
                        Add Items
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItemForDeadline(item.id)}
                      >
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {item.deadline ? format(new Date(item.deadline), 'PP') : 'Add Deadline'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 text-finance-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {showSubItems[item.id] && (
                    <CollapsibleContent>
                      <SubItemInput
                        budgetItemId={item.id}
                        subItems={item.subItems}
                        onAddSubItem={handleAddSubItem}
                        onDeleteSubItem={deleteSubItem}
                        budgetItemAmount={item.amount}
                      />
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={() => navigate('/tracking')}
              className="bg-finance-primary hover:bg-finance-secondary"
              disabled={budgetItems.length === 0}
            >
              Continue to Tracking
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={!!selectedItemForDeadline} onOpenChange={() => setSelectedItemForDeadline(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Deadline</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={budgetItems.find(item => item.id === selectedItemForDeadline)?.deadline}
            onSelect={(date) => {
              if (date && selectedItemForDeadline) {
                updateItemDeadline(selectedItemForDeadline, date);
                setSelectedItemForDeadline(null);
              }
            }}
            className="pointer-events-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetAllocation;
