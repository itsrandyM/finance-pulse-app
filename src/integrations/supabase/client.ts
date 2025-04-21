
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gczgctmktmkgbqiodiab.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemdjdG1rdG1rZ2JxaW9kaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzM2NDUsImV4cCI6MjA2MDA0OTY0NX0.KdOEB-Wg39AKbA7Hx5E1372RN_VcMiYQlbNDJCwHZ0c";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
