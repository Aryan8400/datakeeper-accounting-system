import { createClient } from "@supabase/supabase-js";

// Get credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// Validate that credentials are provided
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local for local dev, or in Vercel Environment Variables for production."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const appUrl = APP_URL;
