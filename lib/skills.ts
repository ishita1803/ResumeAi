// Canonical skill taxonomy for deterministic matching (no embeddings needed for MVP).
export const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ["javascript", "js", "es6", "ecmascript"],
  typescript: ["typescript", "ts"],
  react: ["react", "react.js", "reactjs", "next.js", "nextjs"],
  "node.js": ["node.js", "nodejs", "node", "express", "express.js"],
  python: ["python", "django", "flask", "fastapi"],
  java: ["java", "spring", "spring boot", "hibernate"],
  "c++": ["c++", "cpp"],
  go: ["golang", "go"],
  rust: ["rust"],
  sql: ["sql", "postgres", "postgresql", "mysql", "mongodb", "database", "dbms"],
  git: ["git", "github", "gitlab", "version control"],
  docker: ["docker", "containers", "kubernetes", "k8s", "devops", "ci/cd", "cicd"],
  aws: ["aws", "ec2", "s3", "cloud", "azure", "gcp"],
  linux: ["linux", "bash", "shell scripting", "unix"],
  "machine learning": ["machine learning", "ml", "scikit-learn", "scikit", "tensorflow", "pytorch", "keras", "nlp"],
  "data analysis": ["data analysis", "pandas", "numpy", "excel", "tableau", "power bi", "matplotlib", "data visualization"],
  figma: ["figma", "ui/ux", "wireframing", "prototyping"],
  communication: ["communication", "teamwork", "leadership", "collaboration"],
  dsa: ["dsa", "data structures", "algorithms", "leetcode", "competitive programming"],
  testing: ["testing", "jest", "pytest", "cypress", "unit testing", "selenium"],
  "system design": ["system design", "software architecture", "microservices", "rest api", "api design"],
  html: ["html", "css", "tailwind", "tailwindcss", "frontend", "responsive design"],
};

export const ALL_SKILLS = Object.keys(SKILL_ALIASES);

function esc(s: string): string {
  return s.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
}

// World-class rule: short tokens MUST match on word boundaries.
// Substring search claims "go" from "ongoing", "ts" from "sports",
// "ml" from "html" and "api" from "rapid" — all phantom skills.
const regexCache = new Map<string, RegExp>();
function termRe(term: string): RegExp {
  let re = regexCache.get(term);
  if (!re) {
    re = new RegExp(`(?<!\\w)${esc(term.toLowerCase())}(?!\\w)`, "i");
    regexCache.set(term, re);
  }
  return re;
}

export function normalizeSkill(s: string): string {
  const l = s.toLowerCase().trim().replace(/\s+/g, " ");
  for (const [canon, aliases] of Object.entries(SKILL_ALIASES)) {
    if (canon === l) return canon;
    if (aliases.some((a) => a === l || termRe(a).test(l))) return canon;
  }
  return l;
}

export function countMentions(text: string, skill: string): number {
  const terms = [skill, ...(SKILL_ALIASES[skill] ?? [])];
  let n = 0;
  for (const t of terms) {
    const re = new RegExp(`(?<!\\w)${esc(t)}(?=\\W|$)`, "gi");
    n += text.match(re)?.length ?? 0;
  }
  return n;
}

export function extractSkillsFromText(text: string): string[] {
  const found = new Set<string>();
  for (const [canon, aliases] of Object.entries(SKILL_ALIASES)) {
    const terms = [canon, ...aliases];
    if (terms.some((t) => termRe(t).test(text))) found.add(canon);
  }
  return [...found];
}

export function extractJDKeywords(jd: string): string[] {
  return extractSkillsFromText(jd);
}
