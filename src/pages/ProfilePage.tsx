
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
import { LogOut, User, Lock } from 'lucide-react';
import { format } from 'date-fns';

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
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [previousBudgets, setPreviousBudgets] = useState<PreviousBudget[]>([]);
  const { resetBudget } = useBudget();

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchPreviousBudgets();
    }
  }, [user]);

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
      const { data, error } = await supabase
        .from('budgets')
        .select('id, period, total_budget, created_at')
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
            // Default to 30 days for custom or unknown periods
            endDate.setDate(startDate.getDate() + 30);
        }
        
        // Get the total spent for this budget
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')
          .in('budget_item_id', 
            supabase
              .from('budget_items')
              .select('id')
              .eq('budget_id', budget.id)
          );
        
        let totalSpent = 0;
        if (!expensesError && expensesData) {
          totalSpent = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0);
        }
        
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

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
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

      <h2 className="text-2xl font-bold mt-10 mb-4">Budget History</h2>
      {previousBudgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {previousBudgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget</CardTitle>
                <CardDescription>
                  {format(new Date(budget.created_at), 'MMM dd, yyyy')} - {format(new Date(budget.end_date), 'MMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-lg font-semibold">${budget.total_budget.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-semibold">${budget.total_spent.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No previous budgets found.</p>
      )}
    </div>
  );
};

export default ProfilePage;
