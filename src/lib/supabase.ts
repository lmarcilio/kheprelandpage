import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const envUrl = process.env.VITE_SUPABASE_URL;
  const envKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('khepre_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('khepre_supabase_key') : null;

  return {
    url: localUrl || envUrl || '',
    key: localKey || envKey || ''
  };
};

const config = getSupabaseConfig();

export const hasValidSupabaseConfig = Boolean(config.url) && Boolean(config.key);

// Only create the client if we have the config to avoid "supabaseUrl is required" error
export const supabase = hasValidSupabaseConfig 
  ? createClient(config.url, config.key)
  : (null as any);

export const updateSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('khepre_supabase_url', url);
  localStorage.setItem('khepre_supabase_key', key);
  window.location.reload(); // Reload to re-initialize with new config
};
