
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { BudgetItem } from '@/types/budget';
import { formatCurrency } from '@/lib/formatters';

interface CarryOverItemsEditorProps {
  items: BudgetItem[];
  remainingBudget: number;
  onItemsUpdate: (items: BudgetItem[]) => void;
  onRemainingBudgetUpdate: (amount: number) => void;
}

const CarryOverItemsEditor: React.FC<CarryOverItemsEditorProps> = ({
  items,
  remainingBudget,
  onItemsUpdate,
  onRemainingBudgetUpdate
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingAmount, setEditingAmount] = useState('');
  const [editingRemainingBudget, setEditingRemainingBudget] = useState(false);
  const [remainingBudgetInput, setRemainingBudgetInput] = useState(remainingBudget.toString());

  const handleEditItem = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setEditingName(item.name);
    setEditingAmount(item.amount.toString());
  };

  const handleSaveItem = () => {
    if (!editingItemId) return;
    
    const updatedItems = items.map(item => 
      item.id === editingItemId 
        ? { ...item, name: editingName, amount: parseFloat(editingAmount) || 0 }
        : item
    );
    
    onItemsUpdate(updatedItems);
    setEditingItemId(null);
    setEditingName('');
    setEditingAmount('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingName('');
    setEditingAmount('');
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsUpdate(updatedItems);
  };

  const handleSaveRemainingBudget = () => {
    const amount = parseFloat(remainingBudgetInput) || 0;
    onRemainingBudgetUpdate(amount);
    setEditingRemainingBudget(false);
  };

  const handleCancelRemainingBudgetEdit = () => {
    setRemainingBudgetInput(remainingBudget.toString());
    setEditingRemainingBudget(false);
  };

  if (items.length === 0 && remainingBudget === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Items to Carry Over</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Remaining Budget Section */}
        {remainingBudget > 0 && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium text-blue-800">Remaining Budget</Label>
                {editingRemainingBudget ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        KSh
                      </span>
                      <Input
                        type="number"
                        value={remainingBudgetInput}
                        onChange={(e) => setRemainingBudgetInput(e.target.value)}
                        className="pl-12"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <Button size="sm" onClick={handleSaveRemainingBudget}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelRemainingBudgetEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(remainingBudget)}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingRemainingBudget(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              This amount will be added to your new budget
            </p>
          </div>
        )}

        {/* Budget Items Section */}
        {items.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Budget Items</Label>
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          KSh
                        </span>
                        <Input
                          type="number"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                          className="pl-12"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveItem}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{item.name}</p>
                        {item.isContinuous && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Continuous
                          </span>
                        )}
                        {item.isRecurring && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.amount)}
                        {item.isContinuous && item.spent > 0 && (
                          <span className="ml-2 text-xs">
                            (Remaining: {formatCurrency(Math.max(0, item.amount - item.spent))})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditItem(item)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarryOverItemsEditor;
