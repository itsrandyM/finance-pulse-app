
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { BudgetProvider } from "./contexts/BudgetContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { useAuth } from "./contexts/AuthContext";
import BudgetPeriodSelectPage from "./pages/BudgetPeriodSelectPage";
import BudgetAmountInputPage from "./pages/BudgetAmountInputPage";
import IncomeSetupPage from "./pages/IncomeSetupPage";
import BudgetAllocation from "./components/BudgetAllocation";
import ExpenseTracking from "./components/ExpenseTracking";
import IncomeTracking from "./components/IncomeTracking";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import React from "react";

const queryClient = new QueryClient();

// Protected route component that ensures BudgetProvider is available
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <BudgetProvider>
      <Layout>
        {children}
      </Layout>
    </BudgetProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LoadingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <BudgetPeriodSelectPage />
                </ProtectedRoute>
              } />
              <Route path="/income-setup" element={
                <ProtectedRoute>
                  <IncomeSetupPage />
                </ProtectedRoute>
              } />
              <Route path="/budget-amount" element={
                <ProtectedRoute>
                  <BudgetAmountInputPage />
                </ProtectedRoute>
              } />
              <Route path="/budget" element={
                <ProtectedRoute>
                  <BudgetAllocation />
                </ProtectedRoute>
              } />
              <Route path="/income" element={
                <ProtectedRoute>
                  <IncomeTracking />
                </ProtectedRoute>
              } />
              <Route path="/tracking" element={
                <ProtectedRoute>
                  <ExpenseTracking />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LoadingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
