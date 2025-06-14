
-- Add status enum and additional fields to budgets table
DO $$
BEGIN
  -- Create enum for budget status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_status') THEN
    CREATE TYPE budget_status AS ENUM ('active', 'completed', 'abandoned', 'overspent', 'interrupted');
  END IF;
END$$;

-- Add new columns to budgets table
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS status budget_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS actual_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_transactions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS utilization_percentage numeric DEFAULT 0;

-- Create function to calculate budget status based on business logic
CREATE OR REPLACE FUNCTION public.calculate_budget_status(
  p_budget_id uuid,
  p_period text,
  p_created_at timestamp with time zone,
  p_total_budget numeric,
  p_total_spent numeric,
  p_total_transactions integer
) RETURNS budget_status
LANGUAGE plpgsql
AS $$
DECLARE
  v_end_date timestamp with time zone;
  v_is_expired boolean;
  v_utilization_percentage numeric;
  v_has_meaningful_activity boolean;
BEGIN
  -- Calculate expected end date based on period
  CASE p_period
    WHEN 'daily' THEN v_end_date := p_created_at + interval '1 day';
    WHEN 'weekly' THEN v_end_date := p_created_at + interval '7 days';
    WHEN 'bi-weekly' THEN v_end_date := p_created_at + interval '14 days';
    WHEN 'monthly' THEN v_end_date := p_created_at + interval '1 month';
    WHEN 'quarterly' THEN v_end_date := p_created_at + interval '3 months';
    WHEN 'semi-annually' THEN v_end_date := p_created_at + interval '6 months';
    WHEN 'annually' THEN v_end_date := p_created_at + interval '1 year';
    ELSE v_end_date := p_created_at + interval '30 days';
  END CASE;
  
  v_is_expired := now() > v_end_date;
  v_utilization_percentage := CASE WHEN p_total_budget > 0 THEN (p_total_spent / p_total_budget) * 100 ELSE 0 END;
  v_has_meaningful_activity := p_total_transactions >= 2 OR v_utilization_percentage >= 10;
  
  -- Determine status based on business logic
  IF NOT v_is_expired THEN
    RETURN 'active';
  ELSIF v_utilization_percentage >= 100 THEN
    RETURN 'overspent';
  ELSIF v_has_meaningful_activity AND v_utilization_percentage >= 80 THEN
    RETURN 'completed';
  ELSIF NOT v_has_meaningful_activity THEN
    RETURN 'abandoned';
  ELSE
    RETURN 'interrupted';
  END IF;
END;
$$;

-- Create function to update budget metrics
CREATE OR REPLACE FUNCTION public.update_budget_metrics(p_budget_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_budget_record record;
  v_total_spent numeric;
  v_total_transactions integer;
  v_utilization_percentage numeric;
  v_new_status budget_status;
BEGIN
  -- Get budget details
  SELECT * INTO v_budget_record FROM budgets WHERE id = p_budget_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate total spent and transactions from budget items
  SELECT 
    COALESCE(SUM(bi.spent), 0),
    COALESCE(COUNT(DISTINCT e.id), 0)
  INTO v_total_spent, v_total_transactions
  FROM budget_items bi
  LEFT JOIN expenses e ON e.budget_item_id = bi.id
  WHERE bi.budget_id = p_budget_id;
  
  -- Calculate utilization percentage
  v_utilization_percentage := CASE 
    WHEN v_budget_record.total_budget > 0 THEN (v_total_spent / v_budget_record.total_budget) * 100 
    ELSE 0 
  END;
  
  -- Calculate new status
  v_new_status := calculate_budget_status(
    p_budget_id,
    v_budget_record.period,
    v_budget_record.created_at,
    v_budget_record.total_budget,
    v_total_spent,
    v_total_transactions
  );
  
  -- Update budget with calculated metrics
  UPDATE budgets 
  SET 
    total_transactions = v_total_transactions,
    utilization_percentage = v_utilization_percentage,
    status = v_new_status,
    actual_end_date = CASE 
      WHEN v_new_status != 'active' AND actual_end_date IS NULL THEN now()
      ELSE actual_end_date
    END
  WHERE id = p_budget_id;
END;
$$;

-- Update existing budgets with calculated metrics
DO $$
DECLARE
  budget_record record;
BEGIN
  FOR budget_record IN SELECT id FROM budgets LOOP
    PERFORM update_budget_metrics(budget_record.id);
  END LOOP;
END$$;
