import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are missing. Copy .env.local.example to .env.local and add your VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.",
  );
}

const supabaseClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabase = supabaseClient;

export const isSupabaseConfigured = Boolean(supabaseClient);

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error(
      "Supabase is not configured. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your env file.",
    );
  }
  return supabaseClient;
};
