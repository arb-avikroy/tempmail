import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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
