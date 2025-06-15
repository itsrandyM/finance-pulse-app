
-- Add budget_period_start column to income_entries table
ALTER TABLE public.income_entries 
ADD COLUMN budget_period_start TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX idx_income_entries_budget_period_start 
ON public.income_entries(budget_period_start);

-- Update existing income entries to have a budget_period_start based on their created_at
-- This assigns existing income to their creation time for backward compatibility
UPDATE public.income_entries 
SET budget_period_start = created_at 
WHERE budget_period_start IS NULL;

-- Make budget_period_start required for new entries
ALTER TABLE public.income_entries 
ALTER COLUMN budget_period_start SET NOT NULL;
