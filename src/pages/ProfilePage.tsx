import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBudget } from '@/contexts/BudgetContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Lock, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatters';
import BudgetHistoryCard from '@/components/budget/BudgetHistoryCard';
import BudgetHistorySummary from '@/components/budget/BudgetHistorySummary';

interface ProfileData {
  id: string;
  full_name: string | null;
  created_at: string | null;
}

interface PreviousBudget {
  id: string;
  period: string;
  total_budget: number;
  created_at: string;
  end_date: string;
  total_spent: number;
  status?: string;
  utilization_percentage?: number;
  total_transactions?: number;
  actual_end_date?: string;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [previousBudgets, setPreviousBudgets] = useState<PreviousBudget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<PreviousBudget[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { resetBudget } = useBudget();

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchPreviousBudgets();
    }
  }, [user]);

  useEffect(() => {
    filterBudgets();
  }, [previousBudgets, statusFilter]);

  const filterBudgets = () => {
    let filtered = [...previousBudgets];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(budget => budget.status === statusFilter);
    }
    
    setFilteredBudgets(filtered);
  };

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfileData(data);
      setFullName(data.full_name || '');
    } catch (error: any) {
      console.error('Error fetching profile data:', error.message);
    }
  };
  
  const fetchPreviousBudgets = async () => {
    try {
      // Update budget metrics first
      const { data: budgetIds, error: budgetIdsError } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user?.id);
      
      if (budgetIdsError) throw budgetIdsError;
      
      // Update metrics for all budgets
      for (const budget of budgetIds) {
        await supabase.rpc('update_budget_metrics', { p_budget_id: budget.id });
      }
      
      // Fetch updated budget data
      const { data, error } = await supabase
        .from('budgets')
        .select('id, period, total_budget, created_at, status, utilization_percentage, total_transactions, actual_end_date')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Calculate end dates and fetch total spent for each budget
      const budgetsWithDetails = await Promise.all(data.map(async (budget) => {
        const startDate = new Date(budget.created_at);
        let endDate = new Date(startDate);
        
        switch (budget.period) {
          case 'daily':
            endDate.setDate(startDate.getDate() + 1);
            break;
          case 'weekly':
            endDate.setDate(startDate.getDate() + 7);
            break;
          case 'bi-weekly':
            endDate.setDate(startDate.getDate() + 14);
            break;
          case 'monthly':
            endDate.setMonth(startDate.getMonth() + 1);
            break;
          case 'quarterly':
            endDate.setMonth(startDate.getMonth() + 3);
            break;
          case 'semi-annually':
            endDate.setMonth(startDate.getMonth() + 6);
            break;
          case 'annually':
            endDate.setFullYear(startDate.getFullYear() + 1);
            break;
          default:
            endDate.setDate(startDate.getDate() + 30);
        }
        
        // Get the total spent for this budget
        const { data: itemsData, error: itemsError } = await supabase
          .from('budget_items')
          .select('spent')
          .eq('budget_id', budget.id);
        
        if (itemsError) throw itemsError;
        
        const totalSpent = itemsData.reduce((sum, item) => sum + Number(item.spent), 0);
        
        return {
          ...budget,
          end_date: format(endDate, 'yyyy-MM-dd'),
          total_spent: totalSpent
        };
      }));
      
      setPreviousBudgets(budgetsWithDetails);
    } catch (error: any) {
      console.error('Error fetching previous budgets:', error.message);
    }
  };

  const calculateSummaryStats = () => {
    const totalBudgets = previousBudgets.length;
    const totalBudgeted = previousBudgets.reduce((sum, budget) => sum + budget.total_budget, 0);
    const totalSpent = previousBudgets.reduce((sum, budget) => sum + budget.total_spent, 0);
    const averageUtilization = totalBudgets > 0 ? 
      previousBudgets.reduce((sum, budget) => sum + (budget.utilization_percentage || 0), 0) / totalBudgets : 0;
    
    const completedBudgets = previousBudgets.filter(b => b.status === 'completed').length;
    const abandonedBudgets = previousBudgets.filter(b => b.status === 'abandoned').length;
    const overspentBudgets = previousBudgets.filter(b => b.status === 'overspent').length;
    
    const totalSaved = previousBudgets
      .filter(b => b.total_budget > b.total_spent)
      .reduce((sum, b) => sum + (b.total_budget - b.total_spent), 0);
    
    const totalOverspent = previousBudgets
      .filter(b => b.total_spent > b.total_budget)
      .reduce((sum, b) => sum + (b.total_spent - b.total_budget), 0);

    return {
      totalBudgets,
      totalBudgeted,
      totalSpent,
      averageUtilization,
      completedBudgets,
      abandonedBudgets,
      overspentBudgets,
      totalSaved,
      totalOverspent
    };
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (error) throw error;
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: window.location.origin + '/auth?reset=true',
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      resetBudget();
      navigate('/auth');
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const summaryStats = calculateSummaryStats();

  return (
    <div className="container max-w-6xl py-4 sm:py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Profile</h1>
      
      {/* Profile Management Section - Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={updateProfile} 
              disabled={loading} 
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Account Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Reset Password
            </Button>
            
            <Separator className="my-4" />
            
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Budget History Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Budget History</h2>
          
          {previousBudgets.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
                <option value="overspent">Overspent</option>
                <option value="interrupted">Interrupted</option>
                <option value="active">Active</option>
              </select>
            </div>
          )}
        </div>

        {previousBudgets.length > 0 ? (
          <>
            <BudgetHistorySummary stats={summaryStats} />
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBudgets.map((budget) => (
                <BudgetHistoryCard
                  key={budget.id}
                  budget={budget}
                  onClick={() => {
                    // Could add detail view functionality here
                    console.log('Budget details:', budget);
                  }}
                />
              ))}
            </div>
            
            {filteredBudgets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No budgets found for the selected filter.
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No budget history found.</p>
            <p className="text-sm text-muted-foreground">
              Start creating budgets to see your financial journey here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
