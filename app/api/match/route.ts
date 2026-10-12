import { NextResponse } from "next/server";
import { aiMatch } from "@/lib/gemini";
import { matchJob } from "@/lib/analysis";
import type { ParsedProfile, JobMatch } from "@/lib/types";
import { authed, findMatch, saveMatch, sha } from "@/lib/server-db";

export async function POST(req: Request) {
  try {
    const { profile, jobs } = await req.json() as { profile: ParsedProfile; jobs: { title: string; company: string; jd: string }[] };
    if (!profile || !jobs?.length) return NextResponse.json({ error: "Profile + at least 1 JD required." }, { status: 400 });
    const list = jobs.slice(0, 3);
    const skillSig = [...profile.skills].sort().join("|").toLowerCase();

    const auth = await authed().catch(() => null);
    const matches: JobMatch[] = [];
    const dbIds: (string | null)[] = [];
    let strategy: string | undefined;
    let allCached = true;

    // Per-JD token saver: same profile skills + same JD → stored row, no AI.
    for (const j of list) {
      const jdHash = sha(`${skillSig}::${j.title}::${j.company}::${j.jd}`.toLowerCase());
      if (auth) {
        const hit = await findMatch(auth.userId, auth.sb, jdHash).catch(() => null);
        if (hit?.result && typeof hit.result === "object") {
          matches.push(hit.result as JobMatch);
          dbIds.push(hit.id as string);
          if (!strategy && typeof hit.strategy === "string" && hit.strategy) strategy = hit.strategy as string;
          continue;
        }
      }
      allCached = false;
      matches.push(matchJob(profile, j.jd, j.title, j.company));
      dbIds.push(null);
    }

    // One strategy call per batch, only when something was freshly computed.
    if (!allCached) {
      const r = await aiMatch(profile, list);
      for (let i = 0; i < matches.length; i++) {
        if (dbIds[i] === null) {
          // aiMatch recomputes deterministically-identical matches; keep ours, take strategy.
          const fresh = (r.matches as JobMatch[])[i];
          if (fresh) matches[i] = { ...matches[i], id: fresh.id };
        }
      }
      if (r.strategy) strategy = r.strategy as string;
    }

    // Persist fresh rows so repeats + /jobs/[id] never cost tokens.
    if (auth) {
      for (let i = 0; i < list.length; i++) {
        if (dbIds[i]) continue;
        const jdHash = sha(`${skillSig}::${list[i].title}::${list[i].company}::${list[i].jd}`.toLowerCase());
        const id = await saveMatch(auth.userId, auth.sb, {
          title: list[i].title, company: list[i].company, jd: list[i].jd.slice(0, 8000),
          jd_hash: jdHash, strategy: strategy ?? "", result: matches[i],
        }).catch(() => null);
        dbIds[i] = id;
      }
    }

    return NextResponse.json({ matches, strategy, dbIds, cached: allCached });
  } catch {
    return NextResponse.json({ error: "Match failed." }, { status: 500 });
  }
}

// History for the Jobs page (cached reads, no AI).
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("history") !== "1") return NextResponse.json({ error: "Use ?history=1" }, { status: 400 });
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ items: [] });
    const { listHistory } = await import("@/lib/server-db");
    const items = await listHistory(auth.userId, auth.sb, "matches", 10).catch(() => []);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
