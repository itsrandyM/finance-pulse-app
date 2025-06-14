
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import BudgetAllocation from '@/components/BudgetAllocation';
import ExpenseTracking from '@/components/ExpenseTracking';
import ExpenseHistoryPage from '@/pages/ExpenseHistoryPage';
import IncomeTracking from '@/components/IncomeTracking';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';
import { AuthProvider } from '@/contexts/AuthContext';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { Toaster } from '@/components/ui/toaster';
import BudgetPeriodSelectPage from '@/pages/BudgetPeriodSelectPage';
import IncomeSetupPage from '@/pages/IncomeSetupPage';
import BudgetAmountInputPage from '@/pages/BudgetAmountInputPage';
import GlobalLoadingIndicator from '@/components/GlobalLoadingIndicator';
import ErrorPage from '@/pages/ErrorPage';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BudgetProvider>
              <Toaster />
              <GlobalLoadingIndicator />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route index element={<Index />} />
                  <Route path="/budget-setup" element={<BudgetPeriodSelectPage />} />
                  <Route path="/income-setup" element={<IncomeSetupPage />} />
                  <Route path="/budget-amount" element={<BudgetAmountInputPage />} />
                  <Route path="/budget" element={<BudgetAllocation />} />
                  <Route path="/tracking" element={<ExpenseTracking />} />
                  <Route path="/expense-history" element={<ExpenseHistoryPage />} />
                  <Route path="/income" element={<IncomeTracking />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BudgetProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default App;
