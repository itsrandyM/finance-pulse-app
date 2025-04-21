
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BudgetAmountInput from '@/components/BudgetAmountInput';
import { useBudget } from '@/contexts/BudgetContext';

// This component wraps BudgetAmountInput to integrate it with Supabase
const BudgetAmountInputPage = () => {
  const { period, setTotalBudget, initializeBudget } = useBudget();
  const navigate = useNavigate();
  
  if (!period) {
    navigate('/');
    return null;
  }
  
  const handleAmountSubmit = async (amount: number) => {
    setTotalBudget(amount);
    
    // Create the budget in Supabase
    try {
      await initializeBudget(period, amount);
      navigate('/budget');
    } catch (error) {
      // Error is handled in the context
      console.error("Failed to initialize budget:", error);
    }
  };
  
  return <BudgetAmountInput onSubmit={handleAmountSubmit} />;
};

export default BudgetAmountInputPage;
