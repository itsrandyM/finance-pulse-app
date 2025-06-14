
-- Enable RLS for all user-related tables
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_sub_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'budgets' table
CREATE POLICY "Users can manage their own budgets"
ON public.budgets
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for 'income_entries' table
CREATE POLICY "Users can manage their own income entries"
ON public.income_entries
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for 'expenses' table
CREATE POLICY "Users can manage their own expenses"
ON public.expenses
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for 'profiles' table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policies for 'budget_items' table
CREATE POLICY "Users can manage budget items of their own budgets"
ON public.budget_items
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()
  )
);

-- RLS Policies for 'budget_sub_items' table
CREATE POLICY "Users can manage sub-items of their own budget items"
ON public.budget_sub_items
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.budget_items
    JOIN public.budgets ON budget_items.budget_id = budgets.id
    WHERE budget_items.id = budget_sub_items.budget_item_id AND budgets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.budget_items
    JOIN public.budgets ON budget_items.budget_id = budgets.id
    WHERE budget_items.id = budget_sub_items.budget_item_id AND budgets.user_id = auth.uid()
  )
);
