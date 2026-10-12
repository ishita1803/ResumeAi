// Client-side PDF text extraction (free, no API). Falls back to pasted text.
interface PdfTextItem {
  str: string;
  hasEOL?: boolean;
  transform: number[];
}

interface PdfPage {
  getTextContent: () => Promise<{ items: unknown[] }>;
}

// World-class rule #1: never trust content-stream order. Real resumes use
// multi-column layouts, sidebars and floating text boxes, so raw item order
// interleaves unrelated columns. Reconstruct visual lines from coordinates:
// group runs by baseline (y), order lines top→bottom, runs left→right.
function itemsToLines(items: unknown[]): string[] {
  const runs = (items as Partial<PdfTextItem>[])
    .filter((it): it is PdfTextItem =>
      typeof it.str === "string" && it.str.length > 0 && Array.isArray(it.transform) && it.transform.length === 6
    )
    .map((it) => ({ str: it.str, hasEOL: it.hasEOL === true, x: it.transform[4], y: it.transform[5] }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: string[][] = [];
  let cur: { str: string; x: number }[] = [];
  let curY = Infinity;
  const flush = () => {
    if (cur.length) {
      cur.sort((a, b) => a.x - b.x);
      const line = cur.map((r) => r.str).join(" ").replace(/\s+/g, " ").trim();
      if (line) lines.push([line]);
      cur = [];
    }
  };

  for (const r of runs) {
    // y-jump → new visual line (tolerance 3pt absorbs sub/superscripts)
    if (cur.length && Math.abs(r.y - curY) > 3) flush();
    if (!cur.length) curY = r.y;
    cur.push({ str: r.str, x: r.x });
    if (r.hasEOL) {
      flush();
      curY = Infinity;
    }
  }
  flush();
  return lines.map((l) => l[0]);
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const mod = await import("pdfjs-dist");
  const pdfjs = mod as unknown as {
    getDocument: (opts: { data: Uint8Array }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<PdfPage> }> };
    GlobalWorkerOptions: { workerSrc: string };
  };
  // Worker MUST match the installed API version or pdf.js throws
  // "The API version X does not match the Worker version Y".
  // Pin the CDN worker to the exact installed version.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const out: string[] = [];
  const max = Math.min(pdf.numPages, 8);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out.push(...itemsToLines(content.items));
  }
  // Collapse 3+ blank runs, cap length.
  return out.join("\n").replace(/\n{3,}/g, "\n\n").slice(0, 24000);
}

export const SAMPLE_RESUME = `Aarav Sharma
aarav.sharma@example.com | github.com/aaravsharma | linkedin.com/in/aaravsharma

EDUCATION
B.Tech Computer Science, State Engineering College (2023-2027), CGPA 8.1

SKILLS
JavaScript, React, Python, SQL, Git, HTML/CSS

PROJECTS
HostelBite — food ordering web app with React and Node. 200+ students used it during fest.
MarksMate — Python script that parses marksheet PDFs and improved report time by 40%.

EXPERIENCE
Web Dev Intern, Startup Club — shipped landing page, improved load time 30%.

CERTIFICATIONS
SQL Intermediate — HackerRank
`;
