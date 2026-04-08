# Equifax Analytics Dashboard Design Spec

Date: 2026-04-09  
Owner: Abhran / Dashboard Team  
Status: Draft for Review

## 1) Product Goal

Build a premium, black-theme analytics dashboard for Equifax call analytics with:

- Secure single-admin authentication using app-issued JWT
- Real API-backed analytics, call logs, and call detail
- Placeholder UX for unidentified intents (no backend endpoint yet)
- Rich, professional visualizations and animations
- Manual refresh (no auto-refresh)

Primary objective: deliver a production-grade dashboard with enterprise-level clarity, strong visual polish, and secure architecture.

## 2) Scope

### In Scope (V1)

- Admin login (single user)
- JWT auth with secure cookie session
- Dashboard overview with KPI cards and analytics charts
- Call Logs page with pagination and filtering
- Call Detail page with transcript, recording, timeline, and transfer summary
- Unidentified Intents placeholder page with dummy data
- Global date-range filter with presets and custom range
- Manual refresh button
- Premium loading states and animations

### Out of Scope (V1)

- Multi-user auth and role management
- Upstream unidentified intents integration (backend unavailable)
- Real-time push updates/websocket refresh

## 3) UX and Visual Direction

### Design Language

- Black-first premium UI inspired by the provided Memoria-style system
- Data-forward hierarchy: numbers are dominant, labels are restrained
- Calm and confident look: minimal chrome, high clarity

### Color Strategy

- Base UI: monochrome black/gray palette
- Semantic accents:
  - Green for positive trends/success metrics
  - Red for risk/negative outcomes
- Colors appear only when they convey meaning

### Motion and Loading

- Initial load shimmer/skeleton for about 2 seconds
- Staggered reveal for cards and chart containers
- Smooth chart draw animations and KPI count-up
- Manual refresh triggers localized panel loading states

### Interaction Quality

- Dense but readable layout
- Strong hover states with useful feedback (tooltips/details)
- Clear empty/error states across all modules

## 4) Information Architecture

### Pages

1. Login
2. Overview Dashboard
3. Call Logs
4. Call Detail
5. Unidentified Intents (placeholder)

### Global Controls

- Date range presets:
  - Today
  - Yesterday
  - Last 7 Days
  - This Month
  - Custom
- Apply action to fetch filtered data
- Manual refresh button in header/filter zone

## 5) Architecture and Security

## 5.1 Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion for UI animation
- Recharts for analytics visualizations

## 5.2 BFF Pattern

- Use Next.js Route Handlers as backend-for-frontend
- Frontend never accesses Equifax credentials directly
- Server routes proxy and normalize external API responses

## 5.3 Authentication

- Single admin account for V1
- Login submitted to app backend
- Backend validates credentials and issues app JWT
- JWT stored in secure httpOnly cookie
- Middleware protects dashboard and internal API routes
- Logout clears cookie

## 5.4 JWT Details

- Signed with server-side secret
- Includes role/scope claims for dashboard access
- Short-lived (target: 8 hours)
- Verified on each protected request

## 5.5 Upstream API Auth

- Server calls Equifax endpoints via Basic Auth using server env credentials
- Credentials never exposed to browser
- Standardized server error mapping (4xx/5xx/timeout)

## 5.6 Hardening

- Login route rate-limiting
- Input validation for date and pagination/query params
- No sensitive error leaks to UI

## 6) API Mapping to Wireframe Features

Base URL: `https://equifax-intent.demo.oss.voicing.ai`

### 6.1 Overview Analytics

- Endpoint: `GET /api/calls/analytics`
- Query: `start_date`, `end_date`, optional `session_id`

Mapped UI:

- KPI cards:
  - `total_calls`
  - `calls_transferred`
  - `avg_handle_time_secs`
  - `total_call_duration_secs`
  - `intent_recognition_rate`
  - `avg_calls_per_hour`
- Charts:
  - `intent_category_distribution` -> donut/pie
  - `serviceable_intent_distribution` -> bar chart
  - `transfers_by_queue` -> donut/pie
  - `transfers_by_intent` -> dual bar (classified vs transferred)
  - `hourly_volume` -> bar chart
  - `call_end_reasons` -> bar chart

### 6.2 Call Logs

- Endpoint: `GET /api/calls`
- Query: `start_date`, `end_date`, `limit`, `offset`, optional `session_id`
- Pagination count: `GET /api/calls/count`

Mapped UI:

- Paginated table/list
- Search by session ID prefix
- Date-range filtering
- Status/end reason/intent/queue display tags

### 6.3 Call Detail

- Primary endpoint: `GET /api/calls/{call_id}/detail`
- Fallback call record: `GET /api/calls/{call_id}`
- Transcript endpoint: `GET /api/calls/{call_id}/transcript`
- Recording URL endpoint: `GET /api/calls/{call_id}/recording-url`

Mapped UI:

- Full call summary pane
- Transcript chat stream
- Tool-call timeline/event stream
- Recording player (presigned URL)
- Transfer metadata and duration insights

### 6.4 Unidentified Intents

- No API available in current backend
- V1 implementation:
  - Premium placeholder page
  - Dummy, realistic trend and category data
  - Explicit "preview data" indicator

## 7) Discrepancy Check

### Confirmed

- No functional discrepancy for dashboard, call list, and call detail with provided APIs.

### Known Gap

- Unidentified intents backend endpoint does not exist; placeholder is required.

### Potential Integration Risk

- Exact nested schema of some analytics chart arrays may vary.
- Mitigation:
  - Create normalization adapters
  - Graceful no-data handling
  - If needed, adjust final chart bindings once one real analytics payload is validated

## 8) Page-Level UX Specifications

## 8.1 Login

- Premium dark auth card
- Minimal form with strong validation
- Loading shimmer/disabled state on submit
- Clear error message for invalid credentials

## 8.2 Overview Dashboard

- KPI hero row
- Multi-chart grid with responsive behavior
- Advanced tooltips and legends where needed
- Semantic green/red highlights for trend and health values

## 8.3 Call Logs

- Sticky table header
- Dense but legible rows
- Semantic chips for statuses/reasons/intents
- Pagination controls and count display

## 8.4 Call Detail

- Summary header
- Transcript panel
- Audio playback panel
- Tool call and timeline stream
- Transfer insights section

## 8.5 Unidentified Intents

- Styled to same premium standard as real-data pages
- Dummy cards/charts/list
- Preview data notice

## 9) Error, Empty, and Loading States

- All modules include:
  - Loading skeleton/shimmer states
  - Empty states with clear guidance
  - Retry for recoverable failures
  - Clear inline error text without technical leakage

## 10) QA and Code Review Plan

### Functional QA

- Auth flow: login/logout/session protection
- Filter correctness across all pages
- Pagination and detail navigation correctness
- Recording URL and transcript behavior
- Placeholder unidentified intents behavior

### Visual QA

- Dark theme consistency
- Motion smoothness and no visual jank
- Proper chart rendering and tooltip behavior
- Responsive behavior at key breakpoints

### Engineering QA

- Typecheck and lint clean
- API adapter and auth middleware coverage
- Error paths validated

### Code Review

- Full code review pass after implementation
- Focus on:
  - Security boundaries
  - Data correctness and edge cases
  - UI/UX consistency and polish

## 11) Implementation Principles

- UX quality is first-class and non-negotiable
- Security boundary stays server-side
- No fake data except explicitly approved unidentified intents page
- Build reusable chart and card components for consistency
- Keep code modular for future multi-user and endpoint expansion

## 12) Acceptance Criteria

Dashboard is accepted when:

- Admin can log in and access protected pages via JWT cookie auth
- All provided real endpoints are integrated and powering their mapped views
- Unidentified intents page exists as premium placeholder with dummy data
- Date presets + custom range + manual refresh work across modules
- Charts and KPI visualizations are polished, animated, and production quality
- UX matches black premium direction with semantic green/red highlights
- Lint/typecheck pass and code review completed

