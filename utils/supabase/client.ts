import { createBrowserClient } from "@supabase/ssr";

function getEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  return { url, key };
}

export function createClient() {
  const { url, key } = getEnv();
  if (!url || !key) {
    // Return a null-safe stub in demo mode (no creds). Callers must handle null.
    return null as unknown as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  const { url, key } = getEnv();
  return Boolean(url && key);
}
