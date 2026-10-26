import { NextResponse } from "next/server";
import { log, logError, logged } from "@/lib/log";
import { searchLiveJobs } from "@/lib/live-jobs";

export const POST = logged("api.live-jobs.POST", async (req: Request) => {
  try {
    const { skills } = (await req.json()) as { skills?: string[] };
    if (!skills?.length) return NextResponse.json({ jobs: [], queried: [] });
    const result = await searchLiveJobs(skills.slice(0, 8));
    log("info", "api.live-jobs", "searched", { queried: result.queried, found: result.jobs.length });
    return NextResponse.json(result);
  } catch (e) {
    logError("api.live-jobs", e);
    return NextResponse.json({ jobs: [], queried: [], note: "Live job search failed — paste a JD below instead." });
  }
});
