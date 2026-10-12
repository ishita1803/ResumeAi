export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface ParsedProfile {
  name: string;
  email: string;
  phone?: string;
  links?: string[];
  education: string[];
  skills: string[];
  skillLevels: Record<string, SkillLevel>;
  experience: string[];
  projects: string[];
  certifications: string[];
  rawLength: number;
}

export interface HealthIssue {
  section: string;
  severity: "good" | "warn" | "critical";
  message: string;
  fix: string;
}

export interface HealthResult {
  score: number;
  issues: HealthIssue[];
  strengths: string[];
}

export interface SkillGap {
  skill: string;
  status: "have" | "partial" | "missing";
  priority: "high" | "medium" | "low";
  whyItMatters: string;
}

export interface JobMatch {
  id: string;
  /** Supabase row id once persisted (enables /jobs/[id]). */
  dbId?: string | null;
  title: string;
  company: string;
  matchScore: number;
  matched: string[];
  partial: string[];
  missing: string[];
  gaps: SkillGap[];
  verdict: string;
}

export interface RoadmapStep {
  order: number;
  title: string;
  skills: string[];
  weeks: string;
  actions: string[];
  project: string;
  outcome: string;
}

export interface QuizQ {
  id: string;
  skill: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface ImproveSuggestion {
  section: string;
  before: string;
  after: string;
  reason: string;
}

export interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}
