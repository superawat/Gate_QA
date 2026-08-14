# Roadmap And Decisions

This file is the working backlog for future product improvements and important decisions for GateQA.

## How To Use

- Add new work as `FEAT-XXX` or `DEC-XXX`.
- Keep each item short: priority, status, owner, and next action.
- Prefer updating this file when the work is still open.
- Move completed delivery details into `CHANGELOG.md`.

## Current Recommendation Snapshot

- Keep GitHub Pages.
  The repo's current problems are still product/runtime issues, not hosting limits.
- Treat startup split, public parity, and local-first cloud sync as landed foundations.
  The next work should build on them instead of reopening host-migration debates.
- Use the now-shipped search, insights, mock, and Google Auth/cloud sync foundations as the default baseline.
  New product work should build on those shipped surfaces instead of reopening them.
- Use Figma selectively, not by default.
  It is worth it for a landing-page redesign, filter UX redesign, mock-test polish, or any work involving multiple contributors.
- Keep the app local-first with optional Supabase background sync.
  LocalStorage remains the primary zero-latency store, while Supabase backs up bookmarks, notes, solved attempts, and practice streaks with zero local data loss.

## Decision Log

### DEC-019: Mobile UI Subsystem & Responsive Touch Ergonomics Overhaul (FEAT-035)
- Status: Delivered (2026-08-15)
- Priority: P1
- Decision:
  Harden mobile viewport ergonomics and responsiveness across all core views while strictly isolating desktop/web layouts (`≥768px`). Standardize `100vh` to `100dvh` to eliminate mobile browser dynamic address bar jumping. Configure `viewport-fit=cover` and dynamic `<meta name="theme-color">` synchronizer. Implement scroll-reactive auto-collapsing app header on mobile (`-translate-y-full md:translate-y-0`) and horizontal touch swipe-to-dismiss gesture on the navigation drawer. Hide generic bottom navigation tabs on the active Solve route (`/practice/question/:id`) and introduce a dedicated sticky mobile solve action bar (`MobileSolveActionBar.jsx`) with Previous, Bookmark, Calculator toggle, Native Share (`navigator.share`), and Next controls with safe-area padding. Provide a mobile Backup & Sync dropdown in `ProgressManager.jsx` and enable mobile users to browse `MockTestPortal.jsx` catalogs, year cards, setup parameters, and review results on small viewports.
- Why:
  Mobile GATE aspirants frequently practice on smartphones during commutes or quick study sessions. Addressing dynamic viewport clipping, cramped tap targets, double bottom navigation bars, and lack of mobile backup tools dramatically improves mobile UX without introducing any regressions to the desktop 1:1 exam and practice experiences.

### DEC-018: Mock Test Subsystem Full Optimization & Data-Integrity Hardening (FEAT-034)
- Status: Delivered (2026-08-14)
- Priority: P0
- Decision:
  Decouple the 1-second exam countdown timer into a dedicated `MockTimerContext` and `useMockTimer()` hook, isolating tick updates strictly to `MockTimerDisplay`. Memoize HTML sanitization and LaTeX parsing with `useMemo` in `MockTestQuestion.jsx`. Preserve the frozen 1:1 TCS iON CBT exam UI replica invariant (min 1024px desktop constraint). Connect Custom Builder subtopic filtering to live filter state, enable GATE DA core question pool grouping, unify practice progress writes on mock submit, enforce strict NAT input regex, back up active in-progress exams to workspace JSON exports, and expand test series history retention to 50 attempts.
- Why:
  Active timer ticks were triggering 60 FPS re-render storms across MathJax equations, question stems, and palette tiles. Decoupling the timer eliminates this overhead without altering any visual layout. Subtopic and DA pool fixes ensure accurate custom test creation and multi-branch parity.

### DEC-017: Performance Insights Multi-Branch Option C Architecture & 0ms Memoization (FEAT-033)
- Status: Delivered (2026-08-14)
- Priority: P0
- Decision:
  Adopt Option C (Unified Effort + Track-Scoped Analytics): maintain global continuous streak, XP, active days, and streak freezes across the platform while dynamically scoping subject mastery, focus areas, mistakes, and review queues via a track selector (`cs`, `da`, `all`). Re-use in-memory `FilterContext.allQuestions` to power 0ms memoized caching in `weakTopicAnalyzer.js` and eliminate duplicate search index fetches. Activate previously orphaned `YearCoverageGrid` and `YearAccuracyTrend` components.
- Why:
  Blending CSE and DA progress distorted syllabus completion metrics, while siloed user profiles broke daily study habit continuity. Option C unifies student effort while providing pinpoint accuracy for syllabus mastery.

### DEC-007: Local-First Additive-Only Cloud Sync Architecture (FEAT-032)
- Status: Delivered
- Priority: P0
- Decision:
  Use a hybrid local-first architecture for User Authentication and Cloud Sync powered by Supabase. `localStorage` is primary and authoritative on device; Supabase functions as an optional, secondary backup and cross-device sync layer. All merge operations use an additive union-merge algorithm (longest note wins, earliest solve wins, bookmarks union, chronological mock deduplication) with automatic pre-merge local snapshot backups.
- Why:
  Students study on unreliable connections and frequently switch devices. Pure cloud-first architectures add blocking latency and risk student progress loss on connection drops. Local-first guarantees 100% offline functionality, instantaneous page loads, zero paywall/login friction, and mathematically eliminates data deletion during sync.

### DEC-005: IIT Madras GATE 2027 Syllabus Breakdown & Editorial Layout
- Status: Delivered
- Priority: P0
- Decision:
  Publish dedicated editorial analysis (`/gate-cse-2027-syllabus-changes`) using a Stripe/GitHub/Vercel-inspired documentation diff format ("Before → After → What's Changed"), replacing horizontal scrolling tables and heavy callout cards.
- Why:
  Avoid teaching generic CS concepts when users want to know "What changed?". Use high-intent decision matrices, compact left-border annotations, official link cards, and responsive mobile transformations.

### DEC-006: Global Header Quick-Access Shortcuts
- Status: Delivered
- Priority: P1
- Decision:
  Add an emerald-themed newspaper icon (`FaNewspaper`) with an animated pulsing ping badge in `AppHeader.jsx` pointing directly to `/gate-cse-2027-syllabus-changes`.
- Why:
  Allows instant access to critical syllabus updates from anywhere in the app without requiring search or drawer navigation.

### DEC-001: Do We Need Figma For UI?

- Status: Recommended for major UI work, optional for small changes
- Priority: P1
- Decision:
  Use a lightweight Figma file if we are redesigning full flows such as landing, practice, filters, or mock test.
- Why:
  GateQA now has enough screens and interaction states that rough planning will save rework.
- Do not require Figma for:
  copy changes, spacing fixes, single-component polish, or bug-only UI fixes
- Simple fallback:
  screenshots plus short notes in PRs/docs are enough for small tweaks

### DEC-002: What Should Come First?

- Status: Approved direction
- Priority: P0
- Decision:
  Finish foundational trust/startup work before adding flashy new features, then move to product refinement.
- Why:
  Startup split, parity, search, insights, and mock mode are now in place, so the best next move is disciplined iteration instead of reopening core architecture.

### DEC-003: Backend Or No Backend?

- Status: Approved Hybrid Strategy (Planned for post-August)
- Priority: P1
- Decision:
  Keep GateQA static and local-first for all question/answer data, while introducing an optional Supabase cloud-sync layer for user authentication, bookmarks, notes, and progress backup.
- Why:
  Static pre-rendered question delivery keeps hosting at $0 and page speed instant, while optional Supabase auth satisfies user requests for cross-device sync and progress safety.

### DEC-007: Zero-Data-Loss User Authentication & Supabase Cloud Sync Strategy
- Status: Approved Plan (Branch `feat/user-auth-supabase`)
- Priority: P1
- Decision:
  Adopt an additive-only union-merge algorithm and localStorage-first write strategy with optional Google OAuth via Supabase Free Tier ($0/mo up to 50k MAUs).
- Why:
  Guarantees zero data loss for students signing in after months of guest practice, protects personal notes and bookmarks across devices, and preserves 100% offline functionality. See `plan/after august/user_auth_and_cloud_sync_plan.md`.

### DEC-004: Migrate Hosts Or Fix Startup First?

- Status: Approved direction
- Priority: P0
- Decision:
  Stay on GitHub Pages for now and spend the current platform cycle on performance, QA discipline, and content hygiene instead of host migration.
- Why:
  Host migration would not fix image debt, Lighthouse regressions, or release-discipline gaps by itself.

### DEC-005: Subject/Subtopic Division in Custom Mock Test Builder

- Status: Approved
- Priority: P1
- Decision:
  The subject and subtopic selection interface in the Custom Mock Test Builder must exactly mirror the division and grouping used in the Practice filters sidebar.
- Why:
  Aligning the Custom Builder with `TopicFilter` and `AptitudeTopicFilter` ensures visual consistency across the platform. Reusing the existing `FilterContext` structured tags simplifies state management and leverages the existing `balancedSample` round-robin sampling logic without requiring separate taxonomy trees.

## Priority Themes

| Priority | Theme | Why it matters | Suggested next step |
| --- | --- | --- | --- |
| P0 | Performance guardrails | The startup split is live, but regressions still need continued enforcement | keep landing/network/Lighthouse assertions healthy and profile any new regressions |
| P0 | Data trust | Public parity is fixed, but answer coverage and future regressions still matter | keep parity green and improve coverage discipline |
| P0 | QA automation | The repo already has strong audit scripts; failures should block regressions earlier | extend release checks with mock E2E and keep validation in CI |
| P1 | Practice UX | Practice flow is the core product, so small friction here hurts every session | refine search, mobile UX, and page-level resilience instead of rebuilding the shell |
| P1 | Mock test readiness | Mock mode is now fully enabled and shipped | monitor usage, add E2E coverage, and close remaining exam-parity polish |
| P2 | Learning layer | Better learning feedback improves repeat usage more than raw question count alone | iterate on weak-topic insights, review queues, and explanation feedback |

## Seed Backlog

| ID | Priority | Status | Improvement | Notes |
| --- | --- | --- | --- | --- |
| FEAT-020 | P0 | Done | Reconcile public-bank parity drift | Public payloads, manifest, pipeline state, validation, and generated docs now agree |
| FEAT-021 | P0 | Done | Move landing to manifest-only startup | Landing no longer initializes the full bank on cold load |
| FEAT-022 | P0 | Done | Lazy-load MathJax and analytics | Landing path no longer carries eager runtime/script cost |
| FEAT-023 | P0 | In Progress | Promote parity and validation checks into CI | Data validation, parity, bundle budget, and landing-network checks are in CI; Lighthouse discipline is still worth tightening |
| FEAT-024 | P1 | Done | Implement real question search | Explore now filters from `public/question-search-index.json` and preserves deep-link URL behavior |
| FEAT-025 | P1 | Done | Add "report a bad question" flow | Practice now links into a prefilled GitHub issue flow without adding a backend |
| FEAT-026 | P1 | Done | Improve resume and landing clarity | Resume flow, manifest summary, and unified loading states now keep practice entry clearer |
| FEAT-027 | P1 | Done | Ship Mock mode after Phase 1/2 are green | Mock mode is now enabled and available on the landing page |
| FEAT-028 | P2 | Done | Add weak-topic analytics | Home now shows a snapshot and `/insights` exposes full local-only subject/subtopic analytics |
| FEAT-029 | P2 | Done | Add offline/PWA support | Shell-first service worker, manifest, and offline fallback are now shipped |
| FEAT-030 | P1 | Done | Implement Practice Preference Toggles | Added shuffle and filter toggles to Explore page, syncing filters/pool and branching sessions |
| FEAT-031 | P1 | Done | Custom Mock Test Builder advanced options | Shipped subtopic selection accordion, dynamic custom duration clamping, and live summary details |
| FEAT-032 | P0 | Done | User Auth & Bi-directional Cloud Sync | Shipped optional Google OAuth, additive union-merge sync engine, offline queue, hardened RLS, and streak tracking |
| FEAT-033 | P0 | Done | Performance Insights Multi-Branch Engine & Caching | Track selector pills (`cs`/`da`/`all`), weighted accuracy, 0ms memoized caching, and activated Year analytics |
| FEAT-034 | P0 | Done | Mock Test Subsystem Optimization & Data-Integrity | Timer Context Decoupling, LaTeX memoization, subtopic wipe fix, DA pool splitting, in-progress backup, and practice missed drill |

## What We Can Improve Right Now

1. Data trust:
   keep parity green, improve answer coverage visibility, and avoid regressions
2. UX clarity:
   keep deep links/filter URLs predictable and close the remaining image/offline hygiene gaps
3. UI workflow:
   use Figma for major flow redesigns, but avoid forcing it on every small UI change
4. Learning value:
   iterate on review and weak-area features instead of only expanding raw question count
5. Release discipline:
   convert validation, parity, mock E2E, and Lighthouse signals into automated release checks

## New Entry Template

```md
### FEAT-XXX: Title

- Status: Proposed | In Progress | Blocked | Done
- Priority: P0 | P1 | P2
- Owner: name
- Why:
- Next step:
```
