
-- Add is_continuous column to budget_items table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'budget_items'
    AND column_name = 'is_continuous'
  ) THEN
    ALTER TABLE public.budget_items
    ADD COLUMN is_continuous BOOLEAN DEFAULT false;
  END IF;
END$$;
