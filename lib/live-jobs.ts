// Free no-auth job sources, queried server-side (avoids CORS + keeps keys unnecessary).
// - Remotive: supports ?search= — primary, queried per profile skill.
// - Arbeitnow: bulk list, filtered locally by skill keywords — secondary top-up.

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  description: string;
  tags: string[];
  source: "Remotive" | "Arbeitnow";
  posted: string;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}

async function fetchJson(url: string, timeoutMs = 12000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "ResumeAI-MVP/1.0 (college project)" },
      next: { revalidate: 600 },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

interface RemotiveJob {
  id: number; url: string; title: string; company_name: string;
  candidate_required_location: string; job_type: string;
  description: string; tags: string[]; publication_date: string;
}

async function remotiveFor(skill: string): Promise<LiveJob[]> {
  const d = (await fetchJson(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(skill)}`
  )) as { jobs?: RemotiveJob[] };
  return (d.jobs ?? []).slice(0, 8).map((j) => ({
    id: `rem-${j.id}`,
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || "Remote",
    type: (j.job_type || "remote").replace(/_/g, " "),
    url: j.url,
    description: stripHtml(j.description || ""),
    tags: (j.tags ?? []).slice(0, 8),
    source: "Remotive" as const,
    posted: (j.publication_date || "").slice(0, 10),
  }));
}

interface ArbeitnowJob {
  slug: string; title: string; company_name: string; location: string;
  remote: boolean; url: string; description: string; tags: string[];
  created_at: string;
}

async function arbeitnowFiltered(skills: string[]): Promise<LiveJob[]> {
  const d = (await fetchJson("https://www.arbeitnow.com/api/job-board-api")) as { data?: ArbeitnowJob[] };
  const needles = skills.map((s) => s.toLowerCase());
  const scored = (d.data ?? []).map((j) => {
    const hay = `${j.title} ${j.description} ${(j.tags ?? []).join(" ")}`.toLowerCase();
    const hits = needles.filter((n) => hay.includes(n)).length;
    return { j, hits };
  }).filter((x) => x.hits > 0).sort((a, b) => b.hits - a.hits).slice(0, 6);
  return scored.map(({ j }) => ({
    id: `arb-${j.slug}`,
    title: j.title,
    company: j.company_name,
    location: j.remote ? `Remote · ${j.location}` : j.location,
    type: j.remote ? "remote" : "on-site",
    url: j.url,
    description: stripHtml(j.description || ""),
    tags: (j.tags ?? []).slice(0, 8),
    source: "Arbeitnow" as const,
    posted: (j.created_at || "").slice(0, 10),
  }));
}

// Tiny in-memory cache: free APIs rate-limit, skills repeat often.
const cache = new Map<string, { at: number; jobs: LiveJob[]; queried: string[] }>();
const TTL = 10 * 60 * 1000;

export async function searchLiveJobs(skills: string[]): Promise<{ jobs: LiveJob[]; queried: string[]; note?: string }> {
  const top = [...new Set(skills.map((s) => s.toLowerCase()))].slice(0, 3);
  if (!top.length) return { jobs: [], queried: [] };
  const key = [...top].sort().join("|");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit;

  const queried = top;
  const settled = await Promise.allSettled([
    ...top.map((s) => remotiveFor(s)),
    arbeitnowFiltered(top),
  ]);

  const seen = new Set<string>();
  const jobs: LiveJob[] = [];
  for (const s of settled) {
    if (s.status !== "fulfilled") continue;
    for (const j of s.value) {
      if (!j.title || seen.has(j.url)) continue;
      seen.add(j.url);
      jobs.push(j);
      if (jobs.length >= 14) break;
    }
    if (jobs.length >= 14) break;
  }

  const result = {
    jobs,
    queried,
    note: jobs.length ? undefined : "Live sources unreachable right now — paste a JD below instead.",
  };
  cache.set(key, { at: Date.now(), ...result });
  return result;
}
