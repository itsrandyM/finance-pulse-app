
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBudget } from '@/contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ArrowRight, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { period, totalBudget, budgetItems } = useBudget();

  const setupSteps = [
    {
      id: 'budget-period',
      title: 'Choose Budget Period',
      description: 'Select how often you want to create budgets',
      completed: !!period,
      action: () => navigate('/budget-setup'),
      icon: Wallet
    },
    {
      id: 'income-setup',
      title: 'Set Up Income',
      description: 'Add your income sources and amounts',
      completed: !!period && totalBudget > 0,
      action: () => navigate('/income-setup'),
      icon: DollarSign
    },
    {
      id: 'budget-allocation',
      title: 'Allocate Budget',
      description: 'Create budget categories and set spending limits',
      completed: budgetItems && budgetItems.length > 0,
      action: () => navigate('/budget'),
      icon: TrendingUp
    }
  ];

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const isSetupComplete = completedSteps === setupSteps.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Wallet</h1>
        <p className="text-lg text-gray-600">
          Let's get your personal finance tracking set up in just a few steps
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <div className="text-sm text-gray-500">
            Setup Progress: {completedSteps}/{setupSteps.length}
          </div>
          <Badge variant={isSetupComplete ? "default" : "secondary"}>
            {isSetupComplete ? "Complete" : "In Progress"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {setupSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card 
              key={step.id} 
              className={`transition-all duration-200 ${
                step.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 cursor-pointer'
              }`}
              onClick={!step.completed ? step.action : undefined}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      step.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        step.completed ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        {step.title}
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  {!step.completed && (
                    <Button onClick={step.action} size="sm">
                      Start
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  {step.completed && (
                    <Button onClick={step.action} variant="outline" size="sm">
                      Review
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {isSetupComplete && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Setup Complete!
            </CardTitle>
            <CardDescription className="text-blue-700">
              Great job! Your budget is all set up. You can now start tracking your expenses and managing your finances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/tracking')} className="bg-blue-600 hover:bg-blue-700">
                Start Tracking Expenses
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button onClick={() => navigate('/budget')} variant="outline">
                View Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {period && totalBudget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ${totalBudget?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500">Total Budget</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {budgetItems?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Budget Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 capitalize">
                  {period}
                </div>
                <div className="text-sm text-gray-500">Budget Period</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Authentication Required</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to sign in to save your budget data and access all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} variant="outline">
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SetupPage;
