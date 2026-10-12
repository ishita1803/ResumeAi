# Design

<!-- impeccable:design-schema 1 -->

## World

Placement-cell instrument: an engineering dossier, not a chatbot. Cool paper, ink ledger, one cobalt calibration accent. Every score looks measured, every gap looks actionable.

## Mode

Operate (dashboard, upload, jobs, quiz, assistant) with one Persuade surface (landing). Scanability and state clarity outrank expression.

## Palette

Light mode only. Restrained neutrals + one committed accent.

- `paper` #F4F6FB (app ground, daylight hostel/library)
- `card` #FFFFFF
- `ink` #0E1525 (primary text)
- `ink-2` #3F4A63 (secondary, tinted from ink — never gray)
- `line` #E2E8F2 (1px borders)
- `cobalt` #2B5CFF (sole accent, actions + active states + CTA panels)
- `verify` #0E9F6E (have/verified)
- `warn` #B45309 (partial/gap, on light #FEF3C7 wash)
- `danger` #DC2626 (missing/critical)
- `sidebar` #FFFFFF with `line` right border (light instrument rail)
- Score washes: good #E6F7EE, mid #FFF4D6, low #FDE8E8; info wash #EAF0FF
- No dark surfaces: emphasis comes from cobalt fills, washes and borders.

## Typography

- Display: `Bricolage Grotesque` (headings, scores 28–44px, tracking -0.025em)
- Body: `Inter` (14–16px, measure 65–75ch)
- Data: `JetBrains Mono` (scores, % deltas, skill tags, JD keywords — never body costume)
- Scale: 12 label / 14 body / 18 section / 28 page / 40 hero. Weight steps 500/650/800 obvious.

## Composition

- App shell: 264px ink sidebar (nav + profile mini + mode tag) + paper content max 1120px.
- First viewport rule: every tool page opens with its instrument visible (score dial + why + next action), never a hero or empty card grid.
- Rhythm: tight groups (8–12px), generous section separation (32–48px), more space above headings than below.
- Landing: thesis viewport (live dossier sample + match dial at scale) → proof strip (how one PDF becomes a plan) → tool atlas → honest close (simulation labels, privacy).

## Components

- Buttons: solid cobalt primary (12px radius, 500 weight, named verbs: "Analyze resume", "Compare jobs"); ghost on ink.
- Score dial: conic sweep + count-up, mono numeral, labeled simulation where predictive.
- Rubric row: label + meter (4px track) + 1-line why — no icon+heading+text card grids, no nested cards.
- Gap ledger: have (emerald dot) / partial (amber) / missing (red) rows with priority chip + why-it-matters.
- Roadmap rail: vertical step rail with what-first ordering, project artifact per step.
- Radius 12–16px, 1px `line` border OR offset shadow `0 8px 24px rgba(14,21,37,.08)` — never both (no ghost card). No gradient text, no glass decoration, no border-left accents, no eyebrow on every section, no 01/02/03 numbering.

## Motion

Route transitions (fade-rise on every navigation) + scroll reveals app-wide; landing adds one authored GSAP moment per chapter (hero entrance, scrub-reveal narrative, scale-fade visual, pinned method story, seamless marquee). Elsewhere static. No scattered entrances, no hover theater. Focus ring: 2px cobalt offset. All motion off under `prefers-reduced-motion`.

## States & Truth

Hover/disabled/loading/error/empty on every control. Errors name problem + recovery ("PDF text unreadable — paste text instead"). Demo data labeled `Synthetic sample`. Scores labeled `Recommendation` / `Simulated` — never hiring verdict. Keyboard operable, 4.5:1 body contrast, 360px→desktop responsive.
