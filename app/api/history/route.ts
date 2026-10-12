import { NextResponse } from "next/server";
import { authed, listHistory } from "@/lib/server-db";

// GET /api/history?kind=matches|roadmaps|attempts — cached reads for history lists.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");
    if (kind !== "matches" && kind !== "roadmaps" && kind !== "attempts") {
      return NextResponse.json({ error: "kind must be matches|roadmaps|attempts" }, { status: 400 });
    }
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ items: [] });
    const items = await listHistory(auth.userId, auth.sb, kind, 10).catch(() => []);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
