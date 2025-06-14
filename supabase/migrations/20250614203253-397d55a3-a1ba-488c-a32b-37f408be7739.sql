
-- Update the budget status calculation function
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
  ELSIF v_utilization_percentage > 100 THEN
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

-- Update all existing budget statuses with the new logic
DO $$
DECLARE
  budget_record record;
BEGIN
  FOR budget_record IN SELECT id FROM budgets LOOP
    PERFORM update_budget_metrics(budget_record.id);
  END LOOP;
END$$;
