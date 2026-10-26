import { NextResponse } from "next/server";
import { aiAnalyze, NotResumeError } from "@/lib/gemini";
import { PARSER_VERSION, resumeGate } from "@/lib/analysis";
import { log, logError, logged } from "@/lib/log";
import { authed, findAnalysis, saveAnalysis, sha } from "@/lib/server-db";

const notResume = () => NextResponse.json({
  error: "That doesn't look like a resume.",
  hint: "We couldn't find your contact details, section headings or skills. Scanned or image-only PDFs can't be read, so paste the text instead, or upload a PDF where you can select the text.",
}, { status: 422 });

export const POST = logged("api.analyze.POST", async (req: Request) => {
  try {
    const { resumeText } = await req.json();
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
      return NextResponse.json({ error: "Paste at least a few lines of resume text, or upload a readable PDF." }, { status: 400 });
    }
    const text = resumeText.slice(0, 20000);
    const gate = resumeGate(text);
    if (!gate.ok) {
      log("warn", "api.analyze", "resume gate rejected", { len: text.length });
      return notResume();
    }
    // Versioned hash: parser-cap changes must never hit rows stored by older caps.
    const hash = sha(`v${PARSER_VERSION}:${text.trim().toLowerCase()}`);

    // Token saver: identical resume → stored analysis, zero Gemini calls.
    const auth = await authed().catch(() => null);
    if (auth) {
      const hit = await findAnalysis(auth.userId, auth.sb, hash).catch(() => null);
      if (hit) {
        log("info", "api.analyze", "cache hit", { analysisId: hit.id });
        return NextResponse.json({
          profile: hit.parsed, health: hit.health, aiNote: hit.ai_note,
          analysisId: hit.id, cached: true,
        });
      }
    }

    const t0 = Date.now();
    const result = await aiAnalyze(text);
    log("info", "api.analyze", "analyzed", { parsedBy: result.parsedBy, signedIn: Boolean(auth), ms: Date.now() - t0 });
    let analysisId: string | null = null;
    if (auth) {
      analysisId = await saveAnalysis(auth.userId, auth.sb, {
        resume_hash: hash, resume_text: text.slice(0, 20000),
        parsed: result.profile, health: result.health, ai_note: result.aiNote ?? "",
      }).catch(() => null);
    }
    return NextResponse.json({ ...result, analysisId, cached: false });
  } catch (e) {
    if (e instanceof NotResumeError) {
      log("warn", "api.analyze", "AI says not a resume");
      return notResume();
    }
    logError("api.analyze", e);
    return NextResponse.json({ error: "Analysis failed. Try again." }, { status: 500 });
  }
});
