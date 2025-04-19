
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { BudgetProvider } from "./contexts/BudgetContext";
import BudgetPeriodSelect from "./components/BudgetPeriodSelect";
import BudgetAmountInput from "./components/BudgetAmountInput";
import BudgetAllocation from "./components/BudgetAllocation";
import ExpenseTracking from "./components/ExpenseTracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BudgetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<BudgetPeriodSelect />} />
              <Route path="/budget-amount" element={<BudgetAmountInput />} />
              <Route path="/budget" element={<BudgetAllocation />} />
              <Route path="/tracking" element={<ExpenseTracking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </BudgetProvider>
  </QueryClientProvider>
);

export default App;
