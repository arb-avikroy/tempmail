import { createClient } from '@supabase/supabase-js';

// These will need to be replaced with your own Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
