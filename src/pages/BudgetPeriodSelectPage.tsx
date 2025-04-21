
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BudgetPeriodSelect from '@/components/BudgetPeriodSelect';
import { useBudget } from '@/contexts/BudgetContext';
import { BudgetPeriod } from '@/contexts/BudgetContext';

// This component wraps BudgetPeriodSelect to integrate it with Supabase
const BudgetPeriodSelectPage = () => {
  const { setPeriod, loadBudget } = useBudget();
  const navigate = useNavigate();
  
  // Check if user has an existing budget
  useEffect(() => {
    const checkExistingBudget = async () => {
      const hasBudget = await loadBudget();
      if (hasBudget) {
        // If they have a budget, go straight to tracking
        navigate('/tracking');
      }
    };
    
    checkExistingBudget();
  }, [loadBudget, navigate]);
  
  const handlePeriodSelection = (period: BudgetPeriod) => {
    setPeriod(period);
    navigate('/budget-amount');
  };
  
  return <BudgetPeriodSelect onPeriodSelected={handlePeriodSelection} />;
};

export default BudgetPeriodSelectPage;
