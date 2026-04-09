# Equifax Analytics Dashboard - Persistent Context

Last updated: 2026-04-09
Primary branch: `main`
Latest confirmed push: run `git log --oneline -1` for current head

## Project Snapshot

- Stack: Next.js App Router + TypeScript + Tailwind + Recharts.
- Auth: JWT session cookie (`httpOnly`) with single admin login.
- Data access: Next.js API routes proxying Equifax upstream APIs (BFF pattern).
- Theme: premium dark UI with semantic greens/reds where appropriate.

## High Priority Product Requirements

- Keep UX polished, premium, and low-friction.
- Default date preset is `Overall` (from `2026-01-01` to current local day end).
- Date filtering must work correctly across local browser timezones.
- URL should stay clean (filters stored client-side, not as visible query params).
- Manual refresh mode only, no auto-refresh loop.
- Pie charts should remain readable and responsive (current approach is split panel).

## Current Important Behaviors

- Date presets are computed in local browser time, then converted to UTC ISO for API calls.
  - India users see India-local day windows.
  - US/Mexico users see their local day windows.
- Filter state is persisted in browser `localStorage` under:
  - `equifax-dashboard-filters-v1`
- Sidebar title is now:
  - `Voicing AI Dashboard`
- Favicon is set to Equifax `.ico` asset copied into:
  - `public/equifax-favicon.ico`

## Key Files To Know

- `src/components/dashboard/charts.tsx`
  - Contains all chart components.
  - `IntentPieChart` uses split-panel layout (donut + structured right legend table).
- `src/hooks/use-dashboard-filters.ts`
  - Canonical client-side filter state and refresh nonce handling.
- `src/lib/date-range.ts`
  - Preset date range logic and UTC conversion behavior.
- `src/components/dashboard/filters-bar.tsx`
  - Preset controls and apply/refresh actions.
- `src/app/(dashboard)/overview/page.tsx`
  - Main dashboard composition and chart usage.

## Recent Decisions / Regressions To Avoid

- A previous `Transfer by Intent` refactor introduced visual regression ("0 0 clutter").
  - That was reverted in commit `0bd10ef`.
  - Any future changes there should be incremental and user-approved.
- Pie chart legend readability issue was addressed via split panel.
  - Avoid going back to cramped tiny legend text.

## Deployment / Infra

- GitHub repo: `https://github.com/abhanu1998/equifax-analytics.git`
- Vercel team/scope: `voicing-ai-e85fb97f` (VoicingAI)
- Live production alias:
  - `https://equifax-analytics.voicing.ai`
- Vercel project:
  - `equifax-analytics`

## Session References

- Design/implementation spec:
  - `docs/superpowers/specs/2026-04-09-equifax-analytics-dashboard-design.md`
- Prior long session transcript (for deeper recovery):
  - `/Users/abhran/.cursor/projects/Users-abhran-Desktop-Projects-equifax-analytics/agent-transcripts/6f6831df-7dc2-4f1e-be1c-7ee7117e8c0b/6f6831df-7dc2-4f1e-be1c-7ee7117e8c0b.jsonl`

## Resume Checklist For Next Session

1. Read this file first.
2. Check latest git state (`git status`, `git log --oneline -5`).
3. If touching charts, validate with `npm run lint` and `npm run build`.
4. If user asks to ship, push to GitHub and deploy Vercel production.
5. Preserve premium UI and avoid regressions in chart readability.
