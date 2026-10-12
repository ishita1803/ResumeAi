import { NextResponse } from "next/server";
import { authed, getQuizAttempt, listHistory, saveQuizAttempt } from "@/lib/server-db";

// POST: store quiz metrics + full review → returns id for /quiz/[id].
// GET ?history=1: recent attempts. GET ?id=: single attempt (RLS-scoped).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topics, count, questions, answers, score } = body;
    if (!Array.isArray(topics) || !Array.isArray(questions)) {
      return NextResponse.json({ error: "topics + questions required." }, { status: 400 });
    }
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ id: null, stored: false });
    const id = await saveQuizAttempt(auth.userId, auth.sb, {
      topics, count: Number(count) || questions.length, questions, answers: answers ?? {}, score: Number(score) || 0,
    }).catch(() => null);
    return NextResponse.json({ id, stored: Boolean(id) });
  } catch {
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const auth = await authed().catch(() => null);
    if (!auth) return NextResponse.json({ items: [], attempt: null });
    if (searchParams.get("history") === "1") {
      const items = await listHistory(auth.userId, auth.sb, "attempts", 10).catch(() => []);
      return NextResponse.json({ items });
    }
    const id = searchParams.get("id");
    if (id) {
      const attempt = await getQuizAttempt(auth.userId, auth.sb, id).catch(() => null);
      return NextResponse.json({ attempt });
    }
    return NextResponse.json({ error: "Use ?history=1 or ?id=" }, { status: 400 });
  } catch {
    return NextResponse.json({ items: [], attempt: null });
  }
}
