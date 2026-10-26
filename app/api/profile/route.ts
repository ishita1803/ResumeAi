import { NextResponse } from "next/server";
import { logError, logged } from "@/lib/log";
import { authed, getLatestProfile, upsertProfile } from "@/lib/server-db";
// GET: latest canonical profile for this user (cross-device restore).
// POST: save canonical profile (called on analyze + profile save).
export const GET = logged("api.profile.GET", async () => {
  try {
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ row: null });
    const row = await getLatestProfile(auth.userId, auth.sb).catch(() => null);
    return NextResponse.json({ row });
  } catch (e) {
    logError("api.profile", e);
    return NextResponse.json({ row: null });
  }
});

export const POST = logged("api.profile.POST", async (req: Request) => {
  try {
    const body = await req.json();
    const { profile, resumeText } = body as {
      profile?: { name?: string; email?: string; [k: string]: unknown };
      resumeText?: string;
    };
    if (!profile) return NextResponse.json({ error: "profile required." }, { status: 400 });
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ saved: false });
    const ok = await upsertProfile(auth.userId, auth.sb, {
      name: String((profile as { name?: unknown }).name ?? "Candidate").slice(0, 80),
      email: String((profile as { email?: unknown }).email ?? ""),
      resume_text: String(resumeText ?? "").slice(0, 20000),
      parsed: profile,
      health: body.health ?? {},
    }).catch(() => false);
    return NextResponse.json({ saved: ok });
  } catch (e) {
    logError("api.profile", e);
    return NextResponse.json({ saved: false });
  }
});

export const DELETE = logged("api.profile.DELETE", async () => {
  try {
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ deleted: false });
    const { bust } = await import("@/lib/server-db");
    const sb = auth.sb as unknown as {
      from: (t: string) => { delete: () => { eq: (c: string, v: unknown) => Promise<unknown> } };
    };
    await sb.from("profiles").delete().eq("user_id", auth.userId).catch((e) => logError("api.profile.delete", e));
    bust(`prof:${auth.userId}`);
    return NextResponse.json({ deleted: true });
  } catch (e) {
    logError("api.profile", e);
    return NextResponse.json({ deleted: false });
  }
});
