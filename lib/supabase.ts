import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT") || key.includes("YOUR_KEY")) return null;
  if (!browserClient) browserClient = createClient(url, key);
  return browserClient;
}

export function getSupabaseConfig() {
  return { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
}
