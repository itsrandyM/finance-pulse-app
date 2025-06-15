
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
        <CardDescription>
          Manage your budget and track expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button onClick={() => navigate('/tracking')} className="w-full">
          Track Expense
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
        <Button onClick={() => navigate('/budget')} variant="outline" className="w-full">
          View Budget
        </Button>
        <Button onClick={() => navigate('/expense-history')} variant="outline" className="w-full">
          Expense History
        </Button>
        <Button onClick={() => navigate('/income-setup')} variant="outline" className="w-full">
          Manage Income
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
