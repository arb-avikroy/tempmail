import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Running in demo mode.');
}

export { supabase };

export type Email = {
  id: string;
  address: string;
  sender: string;
  subject: string;
  body: string;
  created_at: string;
  is_read: boolean;
};

export type TempAddress = {
  id: string;
  address: string;
  created_at: string;
  expires_at: string;
};
