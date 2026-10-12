import { NextResponse } from "next/server";
import { searchLiveJobs } from "@/lib/live-jobs";

export async function POST(req: Request) {
  try {
    const { skills } = (await req.json()) as { skills?: string[] };
    if (!skills?.length) return NextResponse.json({ jobs: [], queried: [] });
    const result = await searchLiveJobs(skills.slice(0, 8));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ jobs: [], queried: [], note: "Live job search failed — paste a JD below instead." });
  }
}
