import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const hasValidSupabaseConfig = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

// Only create the client if we have the config to avoid "supabaseUrl is required" error
export const supabase = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // Type cast to avoid errors in App.tsx
