
import React, { useState } from 'react';
import { useBudget } from '@/contexts/BudgetContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, DollarSign, Repeat, ArrowRight } from 'lucide-react';

interface CreateNewBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateNewBudgetDialog: React.FC<CreateNewBudgetDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { 
    budgetItems, 
    getRemainingBudget, 
    budgetDateRange, 
    period,
    totalBudget,
    getTotalSpent,
    createNewBudgetPeriod,
    resetBudget,
    setContinuousBudgetItems,
    setPreviousRemainingBudget
  } = useBudget();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedContinuousItems, setSelectedContinuousItems] = useState<string[]>([]);
  const [selectedRecurringItems, setSelectedRecurringItems] = useState<string[]>([]);
  const [includeRemainingAmount, setIncludeRemainingAmount] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const remainingBudget = getRemainingBudget();
  const totalSpent = getTotalSpent();

  // Filter items by type
  const continuousItems = budgetItems.filter(item => item.isContinuous);
  const recurringItems = budgetItems.filter(item => item.isRecurring);
  const regularItems = budgetItems.filter(item => !item.isContinuous && !item.isRecurring);

  const handleItemSelection = (itemId: string, type: 'continuous' | 'recurring') => {
    if (type === 'continuous') {
      setSelectedContinuousItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedRecurringItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const handleConfirmCreate = async () => {
    setIsCreating(true);
    try {
      // Prepare items to carry over
      const itemsToCarryOver = [
        ...budgetItems.filter(item => 
          selectedContinuousItems.includes(item.id) || selectedRecurringItems.includes(item.id)
        )
      ];

      // Set up the carry-over data
      setContinuousBudgetItems(itemsToCarryOver);
      
      // Set remaining budget if selected
      if (includeRemainingAmount && remainingBudget > 0) {
        setPreviousRemainingBudget(remainingBudget);
      }

      // Reset current budget
      resetBudget();

      // Close dialogs
      setShowConfirmation(false);
      onOpenChange(false);

      // Navigate to budget setup
      navigate('/budget-setup');
    } catch (error) {
      console.error('Error creating new budget:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Create New Budget Period
            </DialogTitle>
            <DialogDescription>
              This will end your current budget period and create a fresh start. 
              Choose what you'd like to carry over to your new budget.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Budget Summary */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-900">Current Budget Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Period:</span>
                    <div className="font-medium capitalize">{period}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Budget:</span>
                    <div className="font-medium">${totalBudget.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Spent:</span>
                    <div className="font-medium">${totalSpent.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining:</span>
                    <div className={`font-medium ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remainingBudget.toLocaleString()}
                    </div>
                  </div>
                </div>
                {budgetDateRange && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(budgetDateRange.startDate)} - {formatDate(budgetDateRange.endDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Carry Over Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What would you like to carry over?</h3>

              {/* Continuous Items */}
              {continuousItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      Continuous Items
                      <Badge variant="secondary">{continuousItems.length}</Badge>
                    </CardTitle>
                    <DialogDescription>
                      Items that continue with their remaining amounts
                    </DialogDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {continuousItems.map(item => {
                        const remaining = Math.max(0, item.amount - item.spent);
                        return (
                          <div key={item.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`continuous-${item.id}`}
                              checked={selectedContinuousItems.includes(item.id)}
                              onCheckedChange={() => handleItemSelection(item.id, 'continuous')}
                            />
                            <label 
                              htmlFor={`continuous-${item.id}`}
                              className="flex-1 flex justify-between items-center cursor-pointer"
                            >
                              <span>{item.name}</span>
                              <span className="text-sm text-gray-600">
                                ${remaining.toLocaleString()} remaining
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recurring Items */}
              {recurringItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-green-500" />
                      Recurring Items
                      <Badge variant="secondary">{recurringItems.length}</Badge>
                    </CardTitle>
                    <DialogDescription>
                      Items that restart with their full amounts
                    </DialogDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recurringItems.map(item => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`recurring-${item.id}`}
                            checked={selectedRecurringItems.includes(item.id)}
                            onCheckedChange={() => handleItemSelection(item.id, 'recurring')}
                          />
                          <label 
                            htmlFor={`recurring-${item.id}`}
                            className="flex-1 flex justify-between items-center cursor-pointer"
                          >
                            <span>{item.name}</span>
                            <span className="text-sm text-gray-600">
                              ${item.amount.toLocaleString()} full amount
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Remaining Amount */}
              {remainingBudget > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-500" />
                      Remaining Budget Amount
                    </CardTitle>
                    <DialogDescription>
                      Add your unspent budget to the new budget period
                    </DialogDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="remaining-amount"
                        checked={includeRemainingAmount}
                        onCheckedChange={setIncludeRemainingAmount}
                      />
                      <label 
                        htmlFor="remaining-amount"
                        className="flex-1 flex justify-between items-center cursor-pointer"
                      >
                        <span>Include remaining budget</span>
                        <span className="text-sm font-medium text-green-600">
                          +${remainingBudget.toLocaleString()}
                        </span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items that will be lost */}
              {regularItems.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-base text-red-900">
                      Items That Will Not Be Carried Over
                    </CardTitle>
                    <DialogDescription className="text-red-700">
                      These regular budget items will be archived with the current budget
                    </DialogDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {regularItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="text-gray-600">
                            ${item.spent.toLocaleString()} / ${item.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowConfirmation(true)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm New Budget Creation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This action will:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>End your current budget period and archive all data</li>
                <li>Carry over {selectedContinuousItems.length + selectedRecurringItems.length} selected items</li>
                {includeRemainingAmount && remainingBudget > 0 && (
                  <li>Add ${remainingBudget.toLocaleString()} remaining budget to your new period</li>
                )}
                <li>Start a fresh budget setup process</li>
              </ul>
              <p className="font-medium text-red-600 mt-3">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCreate}
              disabled={isCreating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCreating ? 'Creating...' : 'Create New Budget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
