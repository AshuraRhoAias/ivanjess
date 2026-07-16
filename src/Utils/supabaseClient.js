import { createClient } from "@supabase/supabase-js";

// Falls back to placeholder values so a missing NEXT_PUBLIC_SUPABASE_*
// config doesn't crash the build/prerender (createClient throws
// synchronously on an empty URL) — it just fails requests at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
