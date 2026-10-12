# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Indian college students (Tier 2/3, 2nd-4th year) preparing for internships and entry-level roles. They have a PDF resume, apply via LinkedIn/Naukri/off-campus, and need to know: is my resume good, do I fit this JD, what to learn next. Secondary: placement cells reviewing many resumes quickly.

## Product Purpose

ResumeAI is a decision-support career instrument, not a hiring decider. It parses a resume, scores its health, compares it against real job descriptions, exposes skill gaps with priorities, and turns gaps into a learning roadmap, quiz verification, and what-if simulation. Success = student knows exactly what to fix and what to learn next in one session.

## Positioning

One session from PDF to plan: upload once, get health + match + gaps + roadmap + verification quiz + assistant grounded in the same parsed profile. Neighbouring resume checkers stop at a score; ResumeAI keeps every suggestion tied to the candidate's actual extracted experience and never invents qualifications.

## Operating Context

Workflow: upload PDF → auto-parse → health dashboard → paste 1-3 JDs → match scores → gap list → roadmap → practice project → quiz → re-check what-if. Used on laptop in hostel/library, often on free campus Wi-Fi, often without a backend configured (college demo). Resumes are personal data; PDFs stay private, analysis is labelled simulation/recommendation.

## Capabilities and Constraints

Confirmed capabilities (MVP): PDF upload + parse (education, skills, experience, projects, certifications); resume health score + weak-section detection; job match score per JD + multi-job compare; skill match (have/partial/missing); gap analysis with why-it-matters + priority; step-by-step learning roadmap with projects; resume improvement wording grounded in real experience; skill quiz (claims vs verified); job role recommendations; what-if-learn simulator (simulated delta, not hiring promise); profile-aware assistant; readiness dashboard; profile management with skill levels.

Constraints: $0 college budget — Next.js monolith on Vercel free, Supabase free (auth/db/storage), Gemini Flash free tier; pdfjs-dist client parse, no paid parser; no Pinecone — keyword + LLM reasoning, pgvector optional later. Works fully without keys via deterministic local mock engine + localStorage; Supabase/Gemini enhance when env keys are added. Never invent skills, qualifications, or guaranteed outcomes.

## Brand Commitments

Name: ResumeAI. Voice: honest instrument, direct, encouraging, no hype. No existing logo/assets — greenfield. Binding constraint from user: impeccable-grade UI; user only adds Supabase creds + Gemini key later.

## Evidence on Hand

No real resumes, JDs, testimonials, or benchmarks on hand. All demo content in the build is synthetic and labelled as such. Future work must not fabricate placements, customers, or hiring guarantees.

## Product Principles

1. Ground everything in the parsed resume — no invented experience.
2. Scores are instruments, not verdicts — always show why + what next.
3. One profile, every tool — match, roadmap, quiz, chat share the same truth.
4. Free-tier first — every feature must run at $0 and degrade gracefully.
5. Privacy by default — personal data stays private, deletable, and clearly simulated where predictive.

## Accessibility & Inclusion

Target WCAG 2.2 AA for web: keyboard operable, visible focus, 4.5:1 body contrast, responsive from 360px mobile to desktop. No product-specific accessibility requirement established beyond this.
