import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { log, logged } from "@/lib/log";

function env() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

// Exchanges the email-confirmation code for a session, then lands the user
// where they were headed. Sign-up links point here via emailRedirectTo.
export const GET = logged("auth.callback.GET", async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) next = "/dashboard";

  if (code) {
    const { url, key } = env();
    if (url && key) {
      const cookieStore = await cookies();
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {
              // Middleware refresh covers edge cases.
            }
          },
        },
      });
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
      log("error", "auth.callback", "code exchange failed", { err: error.message, status: error.status });
    } else {
      log("error", "auth.callback", "supabase env missing", { hasUrl: Boolean(url), hasKey: Boolean(key) });
    }
  }
  if (!code) log("warn", "auth.callback", "no code param");
  return NextResponse.redirect(`${origin}/auth?error=confirm`);
});
