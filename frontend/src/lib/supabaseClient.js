import { createClient } from "@supabase/supabase-js";

// Replace with your project URL from: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = "{{SUPABASE_URL}}";

// Replace with your anon/public key from: Supabase Dashboard → Project Settings → API
const SUPABASE_PUBLIC_KEY = "{{SUPABASE_KEY}}";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
