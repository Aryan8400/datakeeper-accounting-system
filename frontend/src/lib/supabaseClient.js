import { createClient } from "@supabase/supabase-js";

// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that credentials are provided
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase credentials. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.local"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
