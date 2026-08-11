# Changelog

## 2026-08-11

### Fixed & Optimized
- **Solved-Only Filtering & Progress Sync Repair (AUG-005)**:
  - Standardized solved and bookmarked question collections as deduplicated canonical `string[]` arrays across local storage (`gate_qa_solved_questions`, `gateqa-apt-solved-questions`), Supabase union merges (`user_progress.solved_questions`, `user_progress.aptitude_solved`), and sync audit counts in `sync_log`.
  - Added resilient shape extractor `extractQuestionIdArray()` in `src/utils/cloudSyncManager.js` recovering modern string arrays, legacy attempt-record maps, and numeric-index objects produced by previous buggy cloud syncs.
  - Implemented boot-time `sanitizeProgressStorage()` in `src/utils/storageSanitizer.js` invoked in `src/index.jsx` before React mount to repair any corrupted localStorage entries prior to state hydration.
  - Added reactive event listeners in `src/contexts/FilterContext.tsx` for `gateqa:sync-complete` and `gateqa:auth-signed-in` to automatically trigger `refreshProgressState()` upon cloud sync without requiring a page refresh.
  - Aligned Custom Mock Builder `isSolvedQuestion` predicate in `src/components/MockTest/MockTestShell.jsx` to resolve questions via `AnswerService.getStorageKeyForQuestion(question)` as primary lookup before falling back to `question_uid`.
  - Added PostgreSQL migration `supabase/migrations/20260811000000_add_aptitude_progress_ids.sql` adding `aptitude_solved` and `aptitude_bookmarks` JSONB array columns to `public.user_progress`.
  - Updated and expanded test suites across `cloudSyncManager.test.js`, `storageSanitizer.test.js`, `FilterContext`, and `MockTestShell` (329/329 unit tests passing, 17/17 Playwright E2E tests passing).

## 2026-08-10

### Added & Optimized
- **Cloud Sync Audit Log Slimming & Rate-Limiting (AUG-004)**:
  - Replaced full merged JSONB payload snapshots in `public.sync_log` with a versioned, lightweight count summary (`summaryVersion: 1`, `solvedCount`, `bookmarkCount`, `notesCount`, `mockCount`, `standardProgressCount`, `aptitudeProgressCount`), reducing per-row TOAST storage footprint by ~98% (~11.7 kB → ~0.2 kB).
  - Added request debouncing (750 ms) and a 30-second per-user cooldown in `src/contexts/AuthContext.jsx` to coalesce rapid practice activity and eliminate redundant cloud round-trips.
  - Ensured offline queue changes in `src/utils/syncQueue.js` are preserved until a successful cloud upsert and local refresh complete.
  - Added automated maintenance SQL scripts (`docs/supabase/sync_log_cleanup.sql` and `supabase/sync_log_cleanup_sql_editor.sql`) for PostgreSQL TOAST storage reclamation via `VACUUM FULL`.

### Fixed
- **Custom Mock Builder Scope (AUG-003)**:
  - Centralized strict subject/topic filtering in `src/utils/mockTest.js` before custom-pool validation and sampling.
  - Normalized subject labels/slugs and matched every question subtopic, preventing unselected subjects such as Operating Systems from entering a Data Structures + General Aptitude mock.
  - Added regression coverage for mixed subjects and multi-tag questions.
- **Calculator Parenthesized Expressions (AUG-002)**:
  - Fixed grouped expressions such as `(2+3)*4` entering the numeric `parseFloat` path and displaying `Math Error`.
  - Added a safe arithmetic parser for nested parentheses, unary signs, exponentiation, division, and modulus.
  - Synced the calculator source bundle into `public/calculator/` and verified grouped-expression evaluation with a DOM smoke test.
- **E2E Test Selectors & CI Pipeline Stabilization**:
  - Aligned the primary logo link in `src/components/Layout/AppHeader.jsx` to `aria-label="GATE QA home"`, resolving the locator failure in `practice-flow.spec.js`.
  - Relaxed regex selector in `tests/e2e/a11y.axe.spec.js` from anchored `/^GATE QA$/i` to `/GATE QA/i` (non-anchored) and extended the landing axe audit timeout to 60s to prevent false timeout flakes on heavy DOM scans under load.
  - Disambiguated `getByText("Past Paper")` with `.first()` in `tests/e2e/mock-test-flow.spec.js` to avoid Playwright strict-mode exceptions when text appears in multiple badge/title nodes.
  - Added explicit timeouts for filter state re-hydration (`toBeChecked({ timeout: 8000 })`) and debounced search empty state (`{ timeout: 10000 }`) in `tests/e2e/practice-flow.spec.js`.
  - Increased `MockTestFlow.test.jsx` unit smoke test timeout to 30s to allow the complete 6-step flow (portal → setup → exam → submit → review → exit) to finish reliably in jsdom.
  - Rebuilt production bundle (`dist/`) and verified 100% CI pipeline passing (317/317 unit tests, 17/17 E2E tests, 3/3 Axe audits, Lighthouse mobile, bundle budget, and public parity).

## 2026-08-09

### Added
- **User Authentication & Google OAuth (`feat/user-auth-supabase` / PR #12)**:
  - Added optional Google OAuth sign-in via Supabase (`@supabase/supabase-js`) with permanent Guest Mode fallback if credentials are absent.
  - Implemented `AuthContext.jsx` for centralized session lifecycle management, real-time auth state synchronization, and reactive token refresh.
  - Built `AuthModal.jsx` featuring clean vector icon styling (`react-icons/fi`), accessible focus trapping, keyboard navigation, and explicit privacy guarantees.
  - Built `UserProfileMenu.jsx` header dropdown displaying Google avatar / user initials, email address, sync status indicator, and secure sign-out (preserves local data).
  - Built `GuestDataPrompt.jsx` non-intrusive banner prompting guest users with 50+ solved questions to back up their data for free.
  - Integrated auth UI directly into `AppHeader.jsx` with full dark/light theme fidelity.
  - Updated Privacy Policy (`/privacy` in `StaticPages.jsx`) detailing optional Google Auth, Supabase cloud sync, zero data loss guarantees, and one-click data export rights.

- **Bi-Directional Cloud Sync & Offline Resilience Engine (`cloudSyncManager.js`, `syncQueue.js`)**:
  - Implemented **Zero-Data-Loss Additive Union-Merge Algorithm**:
    - *Bookmarks:* Deduplicated set union (`Set.union(local, cloud)`).
    - *Personal Notes:* Longest Note Wins policy (preserves student effort; falls back to newer timestamp).
    - *Solved Questions:* Union of attempt records, keeping earliest `attemptedAt` timestamp.
    - *Mock Test History:* Deduplicated chronologically by `testId`.
    - *Streak & Heatmap:* Namespaced `progress_records` sync across devices.
  - Implemented pre-merge local snapshot backups in `localStorage` (`gate_qa_backup_<timestamp>`) retaining the 5 most recent snapshots to prevent quota inflation.
  - Added persistent offline sync queue in `localStorage` (`gate_qa_sync_queue`) with exponential retry and reconnect flushing.
  - Added real-time event-driven dashboard refresh in `HomePage.jsx` updating streak count and daily practice heatmap immediately upon `gateqa:sync-complete`.

- **Database Security Hardening & PostgreSQL Schema (`docs/DATABASE.md`, `docs/supabase/`)**:
  - Created and verified 3 core relational tables: `public.profiles`, `public.user_progress`, and `public.sync_log`.
  - Added automated PostgreSQL `handle_new_auth_user()` trigger on `auth.users` for automatic profile provisioning and existing-user backfill.
  - Hardened Row Level Security (RLS) on all user tables restricting access strictly to authenticated owners (`auth.uid() = user_id`).
  - Revoked excessive public and anonymous grants to enforce least-privilege security.

### Fixed
- **Google OAuth Client Secret & Redirect Configuration**:
  - Resolved `Error 400: redirect_uri_mismatch` and `Unable to exchange external code` by configuring Supabase callback URL in Google Cloud Console Authorized redirect URIs (`https://<project-ref>.supabase.co/auth/v1/callback`) and adding localhost port wildcards (`http://localhost:5173/**`, `http://localhost:5174/**`).
- **Merge Conflicts Resolution & Build Verification**:
  - Resolved generated-file merge conflicts across 58 question detail shards, `question-bank-manifest.json`, and `mock_catalog_v1.json` with `main`.
  - Verified 100% test pass rate across 49 test suites (317 tests passing), 0 TypeScript errors, and successful static production build with 3,493 pre-rendered SEO pages.

## 2026-08-06

### Fixed
- **Question Classification & Subtopic Tagging (`go:118376` - GATE CSE 2017 Set 2 Q34)**:
  - Updated subject classification from Digital Logic to Computer Networks.
  - Tagged under Error Detection and Computer Networks to align with official GATE syllabus tags.
- **NAT Answer Precision & Validation (`go:302826` - GATE CSE 2019 Q22)**:
  - Corrected NAT answer key to `0.503` (exact probability $85/169 = 0.502958...$) with valid tolerance range `[0.50, 0.51]`.
- **MCQ Question Type & Answer Key (`go:1297` - GATE CSE 2009 Q5)**:
  - Reclassified question type from NAT to MCQ and set correct answer to Option **B** ($(028F)_{16}$).
- **Practice Session Navigation with "Hide Solved" (`SessionContext.tsx`)**:
  - Dynamically skip already-solved questions when advancing forward through an active ordered practice session with "Hide Solved" filter enabled.

### Added
- **Motivational Quotes Database (`motivationalQuotes.js`)**:
  - Updated student motivational quotes pool.

## 2026-08-05

### Added
- **User Authentication & Cloud Data Sync Master Plan (`feat/user-auth-supabase`)**:
  - Published comprehensive architectural master plan for optional Google OAuth & Supabase Cloud Sync (`plan/after august/user_auth_and_cloud_sync_plan.md`).
  - Designed zero-data-loss **additive-only union-merge algorithm** ensuring pre-existing guest data (`localStorage`) is safely preserved and merged upon first sign-in.
  - Formulated 7 failure scenario safety guarantees covering multi-device sync, network drops, offline fallback, and pre-merge snapshot backups.
  - Documented decision record `DEC-007` in `docs/ROADMAP_AND_DECISIONS.md` and updated runtime topology in `docs/ARCHITECTURE.md`.

### Fixed
- **Question Classification & Answer Fix (`go:80298` - GATE CSE 1987 Q1-xv)**:
  - Reclassified question type from `NAT` to `MCQ`.
  - Set official answer to Option **B** ("Two pointers.") and verified extracted options A, B, C, D.
  - Added manual resolution explanation detailing circular linked list node insertion pointer modifications.
- **Question Subtopics & Syllabus Tagging (`go:3347` - GATE IT 2008 Q37)**:
  - Re-ordered subtopic tags to classify `go:3347` under **Sequential Circuit**, **Flip Flop**, **Finite State Machines**, and **Boolean Algebra**.
  - Rebuilt precomputed subtopic lookup indices and public artifacts to ensure full search filter coverage across all matching subtopics.

## 2026-08-03

### Fixed
- **Google Search Console 404 & Redirect Indexing Resolution (`prerender-seo-pages.mjs`)**:
  - Expanded `buildYearPages()` filter range from `year >= 2015` to **`year >= 1987`**, generating static HTML landing pages for all 40 historical years (1987–2026).
  - Added General Aptitude (`ga` / `/subjects/ga`) and Programming in C (`prog-c` / `/subjects/prog-c`) to `SUBJECT_SEO_MAP` and `SUBJECT_DETAILS` in `prerender-seo-pages.mjs`.
  - Added dual static page generation for percent-encoded URLs (e.g. `go%3A3669` and `go:3669`) in `writePrerenderedPage()` to ensure Linux web servers (GitHub Pages) resolving URL-decoded paths return HTTP 200 OK.
  - Resolved 148 GSC 404 indexing errors across historical year pages, missing subject pages, and percent-encoded question UIDs.
  - Verified 100% parity across all `public/sitemap.xml` URLs with generated static HTML files in `dist/`.

## 2026-07-29

### Added
- **Pillar Editorial Landing Pages (`editorialPages.js`)**:
  - Published `/gate-cs-vs-gate-da` ("GATE CS vs GATE DA: Comprehensive Comparison, Syllabus & Career Opportunities") with side-by-side syllabus overlap matrix, dual-paper strategy callout, and FAQ schema.
  - Published `/gate-cutoff-iit-bombay` ("GATE CS Cutoff for IIT Bombay: M.Tech Admission Marks & Category-Wise Requirements") with category-wise GATE score table, M.Tech TA/RA breakdown, and qualifying vs admission cutoff guide.
  - Published `/best-books-for-gate-cs` ("Best Books for GATE CS Preparation: Standard Textbooks & Reference Guide") with subject-by-subject textbook recommendations (Silberschatz, Cormen, Korth, Tanenbaum, Hopcroft, Aho, Mano, Hamacher, Kreyszig).
- **Educational Rich Results Schema (`prerender-seo-pages.mjs`)**:
  - Implemented `@type: "Quiz"` JSON-LD schema markup on all pre-rendered question pages alongside `@type: "QAPage"` schema for Google Educational Practice Problem Rich Results eligibility.
  - Added `datePublished` and `dateModified` to `schema.org/WebPage` JSON-LD schema.
  - Added targeted `<meta name="keywords">` for all editorial and pre-rendered question pages.
- **Dual Sitemap Infrastructure (`build-public-artifacts.mjs`, `prerender-seo-pages.mjs`, `robots.txt`)**:
  - Implemented post-build `sitemap-questions.xml` generation in `prerender-seo-pages.mjs` containing ONLY verified static HTML question pages (up to `QUESTION_PRERENDER_LIMIT = 5000`).
  - Added `Sitemap: https://gateqa.in/sitemap-questions.xml` directive to `public/robots.txt`.
- **Student Motivational Quotes (`motivationalQuotes.js`)**:
  - Added quotes by Albert Einstein, Benjamin Franklin, Abigail Adams, Estée Lauder, Jimmy Johnson, Goethe, and Longfellow.

### Fixed
- **Google Search Console "153 Not Indexed Pages" Resolution**:
  - Removed 3,419 unrenderable `/practice/question/` SPA URLs from `public/sitemap.xml`, paring `sitemap.xml` down to **75 clean, verified static URLs** (16 editorial pages, 40 year pages 1987–2026, 13 subject pages).
  - Expanded sitemap year range filter from `year >= 2015` to **`year >= 1987`** to capture zero-competition historical PYQ long-tail keywords.
  - Mapped real `dateModified` timestamps from `editorialPages.js` to sitemap entries.
  - Set tiered sitemap priorities: Homepage (`1.0`), Editorial pages (`0.9`), Year/Subject pages (`0.85`), Blog (`0.8`), Utility pages (`0.5`).
  - Embedded full `question.preview` text into static pre-rendered HTML DOM for Googlebot crawlability without JavaScript.
  - Preserved raw HTML markup in Callout rich-copy blocks without `escapeHtml` stripping.
  - Added missing `subject-comparison` side-by-side syllabus comparison table renderer to `buildStaticRoot()` in `prerender-seo-pages.mjs`.

## 2026-07-26

### Changed
- **Mock Test Top Banner GATE 2027 Branding (`MockTestHeader.jsx`, `MockTest.css`)**:
  - Updated mock test header title to `"Graduate Aptitude Test in Engineering 2027"`.
  - Added official organizing institute subtitle: `"Organizing Institute: Indian Institute of Technology Madras"`.
  - Increased GATE logo container dimensions from 48px to 68px (`h-[68px] w-[68px]`).
  - Updated header text color, top border accent, and section dividers to official IIT Madras logo maroon (`#781f19`).
  - Retained pure white background (`#ffffff`) for header contrast.

## 2026-07-25

### Added
- **Blog Hub Multi-Page Pagination & Category Filter Tabs (`BlogListPage.jsx`)**:
  - Implemented category filter tabs (`All`, `Exam Guides`, `Syllabus Updates`, `Subject Guides`) with memoized search and category filtering logic.
  - Added 6-resource multi-page pagination controls (`[Previous] 1 2 3 [Next]`) with smooth scroll-to-top execution on page transition.
  - Updated Vitest assertions in `BlogListPage.test.jsx` for standard Vitest DOM matching and article title verification.
- **GATE CS 2027 Syllabus Revision Guide (`editorialPages.js`)**:
  - Published comprehensive analysis of the official GATE CS 2027 syllabus released by IIT Madras (`/gate-cse-2027-syllabus-changes`).
  - Added subject-by-subject breakdown for the 3 modified technical sections: Digital Logic (refined minimization techniques), Computer Organization & Architecture (refined hardwired/microprogrammed control unit & memory performance), and Computer Networks (significant scope reduction: removed UDP, ARP, DHCP, ICMP, SMTP, FTP, Email, Flooding, Shortest Path).
  - Integrated Executive Summary change stats card, reassurance callout, omitted topics list, preparation checklist, and FAQ schema.
  - Replaced raw emojis with proper SVG icons (`FaChartLine`, `FaSearch`, `FaCogs`, `FaCheckCircle`, `FaFileAlt`, `FaCoins`, `FaGraduationCap`, `FaBookOpen`, `FaExternalLinkAlt`, `FaMinusCircle`).
  - Added verified official links & download cards for the IIT Madras GATE 2027 portal (`gate2027.iitm.ac.in`), GATE CS 2027 Syllabus PDF, and GA 2027 Syllabus PDF.
  - Updated `/gate-2027-syllabus` article data with 2027 syllabus content and corrected outdated FAQs.
- **Global Header Quick-Access Shortcut (`AppHeader.jsx`)**:
  - Added a dedicated "GATE 2027 Syllabus Changes" quick-access button (`FaNewspaper`) in the right-side header cluster.
  - Styled with emerald theme and an animated pulsing ping badge (`animate-ping`) for immediate discoverability across the application.
- **Editorial Page Component & UI Redesign (`EditorialPage.jsx`, `index.css`)**:
  - Modernized comparison layout to a documentation-style "Before → After → What's Changed" format (inspired by Stripe, GitHub, Vercel docs).
  - Added responsive card transformation for comparison tables on mobile (`<640px`) to eliminate horizontal scrolling.
  - Redesigned callouts into compact left-border annotations to minimize vertical space consumption.
  - Added `split-callout` component for clean two-column decision matrix ("No Changes Needed" vs "Review & Update Required").
  - Added `official-links` component for interactive link cards with icons and external link indicators.
  - Added hero header metadata row displaying last updated date and estimated reading time with gradient accent bar.
  - Added `ep-diff-block__badge--red` style for scope reduction status badges.

### Fixed
- **Syllabus Data Accuracy & FAQ Alignment**:
  - Corrected COA status badge from "Expanded" to "Refined" (amber) and CN status badge from "Updated" to "Reduced" (red).
  - Fixed outdated FAQs in `/gate-2027-syllabus` that previously claimed no changes were expected for 2027.
- **Test Suite Integrity**:
  - All 45 Vitest test files and 293 unit tests passing cleanly.
  - TypeScript `npm run typecheck` passing with 0 errors.

## 2026-07-16

### Added
- **Mock Test Custom Builder Enhancements**:
  - Implemented a 3-way **Solved Questions Policy** filter ("Unsolved Only", "Include Solved", and "Solved Only") in the Custom Builder, providing revision flexibility.
  - Added user-defined **Custom Practice Duration** controls, allowing manual override of the adaptive calculation with durations between 5 and 180 minutes.
  - Updated the setup state structure, question pool filtering logic in `MockTestShell.jsx`, and sidebar layout/summary cards in `MockTestSetup.jsx`.
  - Added comprehensive unit tests in `MockTestShell.test.jsx`.

### Fixed
- **Background Timer Throttling & Precision**:
  - Replaced the simple `setInterval`-based decrement loop in `MockTestContext.tsx` with a wall-clock (`Date.now()`) delta synchronization system.
  - Corrected potential timing drifts and pauses when browser tabs are switched, backgrounded, or minimized, ensuring the countdown continues accurately.
  - Implemented a standard `visibilitychange` event listener to immediately force-resync and update the timer and question time spent when returning to the tab.
  - Ensured question time spent is fully tracked and recorded for background intervals.
- **LaTeX Math Rendering & Cloudflare Email Obfuscation**:
  - Implemented `cleanLatexHtml` in `src/utils/latexClean.js` to automatically decode Cloudflare email protection tags (`<a class="__cf_email__" ...>`) inside LaTeX equations.
  - Cleaned up nested HTML elements (such as `<br/>` and `<span>`) specifically within display and inline math delimiters (`$$`, `\[ \]`, `\( \)`, `$`) to ensure MathJax receives contiguous plain-text LaTeX nodes.
  - Applied the utility across `Question.jsx` and `MockTestQuestion.jsx` for both question stems and custom option content, resolving display issues where raw LaTeX was rendered instead of formatted tables.
  - Added comprehensive unit tests in `src/utils/latexClean.test.js`.
- **Question Database Correction**:
  - Corrected the answer for question `go:39696` (GATE CSE 2016 Set 1, Question 55) from `2900` to `2500` bytes per second across all database files (`answers_by_question_uid_v1.json`, `answers_master_v1.json`, `answers_by_exam_uid_v1.json`, and `questions-with-answers.json`).
  - Regenerated all detail shards, search index, and manifest to reflect the update.


## 2026-07-05

### Added
- **Granular Subtopic Selection in Custom Mock Test Builder**:
  - Replaced the flat subject chip selection interface with an interactive **Subjects & Subtopics accordion** structure matching the `TopicFilter` sidebar grouping (Core GATE subjects, General Aptitude in a custom pink-themed card, and Optional legacy topics in an amber warning card).
  - Implemented subtopic drill-down checkboxes with parent-subject checkbox bindings.
  - Added parent-subject "Select All" / "Clear All" convenience shortcuts for active subtopics.
  - Implemented dynamic subtopic query parameter routing support by adding `selectedSubtopics` and `expandedSubjectSlug` to the custom mock setup state.
- **Adaptive Mock Test Duration & Clamping**:
  - Implemented smart question count clamping in `MockTestShell` that dynamically restricts the requested question counts to the actual size of the subtopic-filtered pool.
  - Integrated adaptive duration calculations that dynamically scale based on the available questions in the filtered pool to prevent pool starvation or empty mock test generation.

### Changed
- **State Management & State Synchronization**:
  - Added an automatic subtopic purging mechanism that clears all subtopic selections when their parent subject is deselected.
  - Registered helpers for managing subtopic accordion expands/collapses and batch selections.
  - Updated the mock portal preview card and summary panel to reflect the selected subtopics and estimated sampling behavior dynamically.

### Fixed
- **Test Alignment**: Updated Vitest unit tests in `MockTestShell.test.jsx` to match the new hierarchical subtopic accordion titles and input checkbox fields.

## 2026-07-03

### Added
- **Practice Settings & Preference Toggles**:
  - Implemented a persistent **Shuffle Questions** toggle (persisted via `localStorage` in `practicePreference.ts`) to let users swap between randomized and sequential practice sessions.
  - Integrated a **Filters Applied** status/toggle chip on the Explore Page that displays when filters are active. Clicking the chip triggers `clearFilters()` to reset all active sidebar filters, ensuring the sidebar, search list, and practice session pool remain completely synchronized.
  - Updated practice session initialization (`handleOpenQuestion` and `handleStartFilteredPractice`) to automatically branch between sequential (`startOrderedSession`) and shuffled (`startRandomSession`) session starts based on the user's preference.

### Changed
- **Information Architecture & Routing**: Relocated "High Priority Topics" from the Insights section to a standalone resource page.
  - Updated route constant `HIGH_PRIORITY_TOPICS_ROUTE` from `/insights/topics` to `/topics`.
  - Added a legacy redirect in `App.jsx` from `/insights/topics` to `/topics` to preserve existing bookmarks and SEO indexing.
  - Adjusted canonical `path` in `HighPriorityTopicsPage.jsx` to `/topics`.
- **Navigation Layout**:
  - Restructured `GlobalNavigationDrawer.jsx` to group educational resources together: removed the isolated "Insights" section and placed "High Priority Topics" and "Articles & Guides" under a unified "Resources" section.
  - Updated `MobileBottomNav.jsx` shortcut link to point to `/topics`.
- **Resource Discoverability**:
  - Added a featured "Study Guide" card for the High Priority Topics page on the Blog Hub (`BlogListPage.jsx`) to promote visibility.

### Fixed
- **Practice Page Crashes**: Fixed a Temporal Dead Zone (TDZ) ReferenceError regarding `activeFilterCount` and restored the missing `usePracticeApplyFiltersEnabled` export in `practicePreference.ts`.
- **Test Alignment**: Updated Vitest unit tests in `App.test.jsx`, `MobileBottomNav.test.jsx`, and `AppHeader.test.jsx` to assert the correct new path, and adjusted `ExplorePage.test.jsx` selectors for the new toggles.

## 2026-06-28

### Added
- **Feedback Integration**: Added a Google Forms feedback link as an icon in the header (next to the theme toggle) and as a dedicated navigation section in the hamburger drawer.
- **Test Coverage**: Added robust test assertions verifying the visibility and correctness of the new feedback links on both mock and non-mock routes.

### Fixed
- **Support Modal Refactor**: Removed the legacy feedback suggestions section and contact email from the Support Modal.

## 2026-06-17

### Added
- **Optimization Review Rewrite**: Refactored the core `optimization.md` framework into a compressed, table-first format. Split all proposed optimizations into Approved (fully implemented) and Rejected / Insufficient Confidence sections, with a detailed justification matrix for deferred items.
### Fixed
- **Question Subject Tagging**: Corrected a metadata tagging error on question `go:460060` (GATE CSE 2025 Set 1, Q20), removing incorrect subject tags (Operating Systems, Data Structures, Calculus) and properly classifying it under Discrete Mathematics (`discrete-mathematics`, `combinatory`). Rebuilt public question bank index and detail shards to propagate.

## 2026-06-12

### Changed
- **Mock Test Setup UI**:
  - Restructured layout using an `items-stretch` grid with viewport-height-relative constraints (`max-h-[calc(100vh-260px)]`) on both the left selection column and right summary sidebar to balance visual weight, prevent page stretching, and eliminate the large bottom whitespace.
  - Consolidated primary actions: Removed duplicate "Start Mock" and "Reset" buttons from the scrollable panels and laid them out horizontally in the footer bar (`[Back to Modes] ... [Reset] [Start Mock]`).
  - Improved year card layout consistency using CSS Grid `auto-rows-fr` and uniform card heights to balance visual weight.
- **Motivational Quotes**: Expanded and refined the core motivational quotes database (`src/utils/motivationalQuotes.js`) with multiple new additions. Implemented strict case-insensitive, punctuation-ignoring deduplication and globally capped the list at a maximum of 3 carefully selected quotes per author.

### Optimization & Hardening
- **Performance**: Memoized the `MockTestContext` provider value to prevent unnecessary re-renders of the Mock Test UI during every 1-second timer tick.
- **Architecture**: Centralized the site URL (`SITE_URL`) in `src/constants/siteConfig.js` and removed hardcoded `https://gateqa.in` string literals from all informational and SEO landing pages.
- **Resilience**: Implemented granular React `<ErrorBoundary>` wrappers around internal Mock Test components (Header, Question, Palette, ActionBar) to prevent full application crashes from isolated component failures.
- **Accessibility**: 
  - Added a global `useFocusTrap` React hook and integrated it across all modal dialogues to retain keyboard focus within active modals.
  - Injected WAI-ARIA `role="alert"` and `aria-live="assertive"` into `AnswerPanel` and `MockTestQuestion` review feedbacks, ensuring screen readers immediately announce evaluation validations.
  - Added WAI-ARIA Accordion pattern attributes (`aria-expanded`, `aria-controls`) to the `CollapsibleSection` component.
- **Testing**: Added a `coverage` block using the `v8` provider to the Vitest configuration to enforce test coverage thresholds and imported `@testing-library/jest-dom` globally.


## [1.1.0] - 2026-06-11

### Added
- **Collapsible Section Toggles**: Upgraded the `EditorialPage` component (`src/pages/EditorialPage.jsx`) to group rich content under expandable/collapsible `h2` headings dynamically, improving structure and readability.
- **Scroll-Spy Sticky Table of Contents**: Added a desktop table of contents widget in the left column that tracks reading progress using `IntersectionObserver`. Added a mobile-optimized drawer widget (`MobileToCDrawer`) to browse page sections on small viewports.
- **Structured Info Cards Grid**: Enhanced card rendering to display key information items inside a modern, hover-responsive grid with animated background highlights.
- **Why Practice on GateQA Section**: Integrated a dedicated study resources promotion card beneath the main copy, highlighting database scale, pricing (free), and key platform features.
- **Promotional Right Sidebar**: Created a desktop-only call-to-action sidebar directing students to practice sections, highlighting key preparation steps.
- **Zebra-Striped Data Tables**: Modernized responsive tables with colored headers, alternating row styles, and hover highlights.

### Changed
- **Responsive 3-Column Layout Grid**: Reorganized the main structure of the informational/editorial pages into a 3-column layout on wide screens (`15rem 1fr 19rem` grid) while collapsing cleanly to single-column on mobile.
- **Polished Visual Elements**: Unified padding, spacing, borders, and rounded corners for `ep-*` block components (timelines, track cards, callouts, and article lists) inside `src/index.css`.

## [1.0.0] - 2026-06-09

### Added
- **Dedicated Blog Hub (`/blog`)**: Created a premium, search-filterable, responsive blog page (`src/pages/BlogListPage.jsx`) presenting active exam articles and subject practice guides with motion animations and themed styles.
- **Subject Practice Guides on Blog**: Integrated all 11 core computer science subjects from `SUBJECT_SEO_MAP` as beautifully styled cards with specific topic tags in the blog list.
- **Structured Data Tables**: Integrated custom table schema support into the `richCopy` array definition to render responsive, modern HTML data tables for complex blog metrics (dates, fees, cutoffs, syllabus weightages, marking schemes).
- **Subject Key Topics Question Percentages**: Integrated historical question percentage metrics into all 11 core CS subjects in `SUBJECT_SEO_MAP` within `src/utils/landingPages.js`. Added percentage values (`pct`) to each topic object mapping historical question density.
- **Visual Topic Priority Badges**: Enhanced the `TopicPill` component in `SubjectLandingPage.jsx` to render a pill percentage badge color-coded by question weight (e.g. high/medium/low-priority thresholds).
- **SEO Phase 4 (Pre-rendering)**: Configured a post-build static pre-renderer (`scripts/prerender-seo-pages.mjs`) generating crawler-ready HTML snapshots for Subject pages, Year pages, and high-value Question pages. Included static HTML body fallbacks and dynamic meta/canonical/OpenGraph tags without disturbing SPA React routing.
- **SEO Phase 5 (Rich Snippets & Polish)**:
  - Added JSON-LD `FAQPage` schemas and visible Q&A blocks to pre-rendered Subject and Year landing pages.
  - Injected keyword-rich overview content into pre-rendered Subject and Year pages.
  - Redesigned the GitHub Pages fallback redirect (`public/404.html`) into a beautifully themed, branded loading splash screen with auto light/dark mode.
  - Generated and integrated a high-quality, modern, light-themed social preview card (`public/og-cover.png`).
- **SEO Phase 6 (Brand Signals, Alias Pages & Analytics)**:
  - Injected a visually hidden, keyword-rich brand description overview (`#seo-brand-text`) into the homepage layout to assist crawler indexing.
  - Created 5 new pre-rendered short-form alias landing pages (`/gate-cs-pyq`, `/gate-aptitude`, `/mock-tests`, `/operating-systems-pyq`, and `/dbms-pyq`) featuring schema markups and targeted CTAs to match high-volume search queries.
  - Integrated the Google Analytics (gtag.js) script into the document head for traffic monitoring, configured with the site's custom GA Measurement ID.
  - Updated the project `README.md` live link.
  - Configured custom domain tracking in GoatCounter settings.
- **Static Pages**: Created `AboutPage`, `ContactPage`, `PrivacyPage`, and `TermsPage` components in `src/pages/StaticPages.jsx` with routes configured in `src/App.jsx`.
- **Sitemap Registration**: Configured `scripts/build-public-artifacts.mjs` to automatically index the four new static pages in the `sitemap.xml`.
- **Subject Syllabus Inclusion**: Appended the official GATE CS syllabus structure directly to each subject definition in `SUBJECT_SEO_MAP`.
- **SEO Keyword Research**: Formatted and captured a master list of raw user queries, informational topics, and search volumes inside `docs/SEO_KEYWORDS.md` for editorial planning.
- **SEO Phase 8 Master Plan**: Added the "Achieving #1 on Google" SEO master strategy to the end of `SEO_Plan.md`.
### Changed
- **Blog Markdown Elements Support**: Upgraded `richCopy` rendering in `EditorialPage.jsx` and static pre-rendering in `scripts/prerender-seo-pages.mjs` to natively support parsed markdown objects including `<h2>`, `<h3>`, and `<ul>` lists.
- **Detailed Editorial Content Injection**: Completely replaced the placeholder text in `/gate-2027`, `/gate-cutoff`, and `/gate-2027-syllabus` practice guides with comprehensive, highly-detailed structural content from Markdown files, utilizing the new subheadings and list structures.
- **Blog Cards Topic Compatibility**: Updated subject card rendering in `BlogListPage.jsx` to reference `topic.label` to support the new structured object format.
- **Updated Blog Content (GATE 2027)**: Fully updated all editorial articles (`src/data/editorialPages.js`) to target the upcoming **GATE 2027** exam cycle, replacing flat lists with structured comparative tables.
- **Pre-renderer Table Formatting**: Updated the static pre-rendering pipeline (`scripts/prerender-seo-pages.mjs`) to render table data as fully styled `<table />` elements rather than raw text, keeping pre-rendered snapshots readable and semantic for search engine crawlers.
- **Global Drawer Navigation**: Replaced the collapsible blog section accordion in the navigation drawer with a direct action link leading directly to `/blog`.
- **Blog Listing Filtering**: Added a `showInBlog` property to `EDITORIAL_PAGES` to hide empty stubs (like `/gate-cs-pyq`, `/gate-aptitude`, etc.) while keeping the 5 real-content articles (GATE 2027, Syllabus, Eligibility, Cutoffs, Pattern) visible.
- **SEO & Pre-rendering Integration**: Updated `scripts/prerender-seo-pages.mjs` to statically build `/blog/index.html` with breadcrumbs and webpage metadata, and configured sitemap generation to output `https://gateqa.in/blog` in `public/sitemap.xml`.
- Replaced basic app title and description metadata with advanced structured metadata injected during pre-rendering.
- Established `1.0.0` versioning starting from the `gateqa.in` root domain release.
- Audited and updated the entire student motivational quotes engine in `src/utils/motivationalQuotes.js` to align 100% with study focus, question practice, scientific logic, and exam stress management: removed societal sacrifice, heart-brain conflicts, purity, forgiveness, and socio-political quotes. Replaced them with study-centric quotes from Dr. B. R. Ambedkar, Swami Vivekananda, Confucius, Richard Feynman, Sir Isaac Newton, and Marie Curie.
- **Terms & Privacy Polish**: Sanitized the Terms and Conditions and Privacy pages to remove automated scraper prohibition clauses and third-party AdSense service trackers. Changed contact address to rawathr01@gmail.com.
- **Syllabus Landing Display**: Modified `src/pages/SubjectLandingPage.jsx` to render the newly added official syllabus content and cross-linked to the comprehensive Syllabus Blueprint.
- **FOUC Prevention**: Re-added the `<div id="app-splash">` loading spinner into `scripts/prerender-seo-pages.mjs`'s `buildStaticRoot` to visually hide the raw unstyled SEO HTML structure before hydration.
- **Pre-render Scaling**: Tripled the `QUESTION_PRERENDER_LIMIT` to 5000 inside the SEO prerender script to ensure all 3,500+ questions in the active exam database receive unique programmatic SEO pages.

### Verified
- Passed 280/280 Vitest unit tests (`npm run test:unit`) post-SEO implementation.
- Verified successful local static output structure (`npm run build`), compiling a total of 1535 static pre-rendered HTML files including the `/blog/index.html` listing page.
- Validated sitemap regeneration including custom `/blog` entry.

## 2026-06-08

### Added
- Added custom CNAME configuration file (`public/CNAME`) specifying `gateqa.in` to point custom domain on GitHub Pages.
- Added deploy safety check scripts in GitHub Actions workflows (`.github/workflows/node.js.yml` and `.github/workflows/gate-question-pipeline.yml`) to fail CI runs if the compiled CNAME artifact (`dist/CNAME`) is missing.

### Changed
- Migrated client application base path from `/Gate_QA` subpath to root `/` for root custom domain launch at `gateqa.in`. Updated configuration across `vite.config.js`, `package.json`, `index.html`, `public/manifest.webmanifest`, `public/offline.html`, and `public/404.html`.
- Updated generated domain configuration within `scripts/build-public-artifacts.mjs`.
- Disabled the migration countdown warning banner inside `AppHeader.jsx` post-launch.
- Updated image-mirroring directory logic in `scripts/mirror-gateoverflow-images.mjs` and `scripts/qa/validate-question-images.mjs` to target root `/question-images` while maintaining compatibility for legacy embedded subpath routes.

### Fixed
- Fixed Playwright E2E and Vitest unit tests to align with the new root base path `/`:
  - Adjusted `playwright.config.cjs` to target root URL.
  - Stripped `/Gate_QA` router path stubs from `tests/e2e/a11y.axe.spec.js`, `tests/e2e/mock-test-flow.spec.js`, and `tests/e2e/practice-flow.spec.js`.
  - Replaced legacy `/Gate_QA/` base route checks inside `src/App.test.jsx`.
  - Updated visual question option `src` assertions in `src/components/MockTest/MockTestQuestion.test.jsx`.
  - Removed deprecated countdown unit tests from `src/components/Layout/AppHeader.test.jsx`.

### Verified
- Built production assets (`npm run build`) successfully with root assets output and synced calculator.
- Passed 280/280 Vitest unit tests (`npm run test:unit`).
- Passed 17/17 Playwright E2E tests (`npm run test:e2e`).
- Successfully validated DNS propagation and verified site live at `https://gateqa.in`.

## 2026-06-07

### Added
- Created a custom domain shift guide (`DOMAIN_SHIFT.md`) in the repository root to document the upcoming migration from `superawat.github.io/Gate_QA/` to `gateqa.in`.

### Changed
- Reorganized the motivational quotes engine in `src/utils/motivationalQuotes.js` to randomize quote presentation. Implemented a deterministic seeded shuffle and a greedy interleaving algorithm (`interleaveQuotes`) to guarantee that quotes from the same author are never shown consecutively.
- Corrected the new custom domain configuration from `GateQA.net` to `gateqa.in` across the codebase, updating the domain migration modal constants and headers.
- Rephrased the domain shift notice popup to reassure users that only the URL is changing (keeping layouts and data exactly the same) and clearly instructing them to download and keep their JSON progress file saved on their local system.

## 2026-06-04

### Fixed
- Hardened Solve page handling for unavailable/stale question UIDs. If detail hydration reports a missing question, the question is removed from the active session queue and the user is moved to the next available question instead of seeing a broken detail card.
- Added a session-level cleanup API to prune unavailable questions from ordered/random practice queues without disturbing the rest of the session.
- Fixed legacy true/false mock questions that were typed as NAT by rendering TRUE/FALSE answer choices and mapping TRUE to `1` and FALSE to `0` for scoring while keeping the question type label as `NAT`.
- Updated drawer labels for `Priority Topics` and `Special Aptitude Section` to use a single solid sky-blue accent without animation overhead.
- Corrected recent mock paper readiness gaps by repairing five malformed answer/type records and expanding embedded option extraction for SQL `<pre>` choices and trailing statement-choice lists. `2025 Set 1`, `2025 Set 2`, and `2024 Set 2` now have 65/65 scorable mock questions.

### Verified
- Confirmed current aptitude artifacts are internally consistent: 36,836 index rows, 36,836 detail rows, 0 missing, 0 invalid.
- `npm run build:public-artifacts`
- `npm run typecheck`
- `npm run qa:validate-aptitude`

## 2026-06-03

### Added
- Converted service boundaries to TypeScript (FEAT-020 Phase 3):
  - Converted `QuestionBankManifestService.js` to `QuestionBankManifestService.ts`
  - Converted `AnswerService.js` to `AnswerService.ts`
  - Converted `GlobalDifficultyService.js` to `GlobalDifficultyService.ts`
  - Converted `AptitudeQuestionService.js` to `AptitudeQuestionService.ts`
  - Converted submodules of `src/services/question-service/`: `QuestionLoader.js`, `QuestionNormalizer.js`, `SubjectTaxonomy.js` to `.ts`
  - Converted aggregator `QuestionService.js` to `QuestionService.ts`
  - Created interface definitions `IQuestionService` in `src/services/question-service/types.ts`
  - Created `src/utils/stripEmbeddedOptions.d.ts` declaration file
- Converted filter UI leaf components to TypeScript (FEAT-020 Phase 4):
  - Converted `TopicFilter.jsx`, `YearFilter.jsx`, `YearRangeFilter.jsx`, `QuestionSearchInput.jsx`, `ProgressFilterToggles.jsx`, and `ActiveFilterChips.jsx` to `.tsx`
  - Added typed props, event handlers, filter context casts, and label lookup maps for the converted filter leaves
- Converted context boundaries to TypeScript (FEAT-020 Phase 5):
  - Converted `SessionContext.jsx` to `SessionContext.tsx` with typed session mode, navigation state, topic-memory, and queue contracts
  - Converted `MockTestContext.jsx` to `MockTestContext.tsx` and `FilterContext.jsx` to `FilterContext.tsx` while preserving current runtime behavior and split filter contexts
- Expanded TS types in `src/types/runtime.ts` (adding canonical, detail shards, and normalized properties on `QuestionRow`).
- Expanded filter runtime contracts in `src/types/runtime.ts` with progress-toggle flags, result-count state, and optional filter actions.

### Changed
- Revamped the High Priority Topics page into a simpler preparation guide with the title `High Priority Topics`, official GateOverflow paper-wise marks data for subject trends, selectable `Subject Marks Over Years`, `Marks Distribution Between Subjects`, and `Min/Avg/Max Marks` graphs with subject-specific colors, CSE-only question-index filtering for practice links, separate Technical Topics and Aptitude Topics sections, short subject labels, and recent paper snapshots.
- Refactored desktop scroll behavior inside `ExplorePage.jsx` and `QuestionPickerList.jsx` so that the question table is an internal scroll area on desktop, keeping pagination visible and matching the filter column height.
- Updated `SmartPracticeBanner` and `CollapsibleSection` inside `InsightsPage.jsx` to use theme-safe border and background variables.
- Refined accessibility label inside `AptitudeTopicFilter.tsx`.

### Fixed
- Fixed Node 24 runner CI hang: Playwright versions prior to 1.60.0 have a known zip extraction bug under Node 24. Upgraded `@playwright/test` to `^1.60.0` in `package.json` to resolve the compatibility issue.

### Verified
- `npm run typecheck` passed.

## 2026-06-02

### Added
- Added TypeScript Phase 0 tooling: `typescript`, React 18 type packages, `tsconfig.json`, `src/vite-env.d.ts`, and `npm run typecheck`.
- Added shared embedded-option normalization in `stripEmbeddedOptions.js` to correctly extract paragraph-labeled A-D/E options from questions, extracting 2,995 embedded rows safely.
- Added `questionType.js` logic to dynamically resolve the `UNKNOWN` question type chip from question metadata, embedded answers, or verified answers, hiding the chip cleanly if unresolved.
- Added build-time and runtime mock validation checks to reject scorable MCQs/MSQs without options or with mismatched answer/option labels, ensuring scoring integrity.
- Added an optionless visual rendering fallback inside `MockTestQuestion.jsx` to render embedded HTML mock options cleanly when a structured option array is missing.
- Added a new `Include previously solved questions` toggle inside the Mock Test setup screen, defaulting to `false` (OFF).
- Added focused tests inside `mockTest.test.js` to assert optionless scorable question blocking and visual layout rendering.
- Added the `htmlAssets.js` utility to safely parse and resolve embedded relative visual resource paths in questions and choices.
- Added a stricter aptitude detail hydration guard so missing shard rows fail loudly instead of rendering an empty question shell.
- Added public aptitude index/detail consistency checks to the aptitude validation gate.

### Changed
- Moved Node CI and the scheduled GATE question pipeline to a Node 24 action/runtime baseline using `actions/checkout@v6`, `actions/setup-node@v6`, `actions/github-script@v8`, and `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.
- Kept the scheduled GATE question pipeline timeout at `330` minutes and documented that old 30-minute cancellations came from earlier workflow revisions.
- Simplified local `gateqa_master_plan.md` into two note-style sections: unresolved/active and completed/resolved.
- Refactored `QuestionNormalizer.js`, `mockTest.js`, and build scripts to use the new unified embedded-option extractor.
- Updated `MockTestShell.jsx` to validate mock pools and prioritize unsolved questions during test generation.
- Updated `MockTestContext.jsx` so that correct answers chosen during mock test sessions mark those questions as solved globally in the user's unified practice history.
- Hardened the GateOverflow image mirror and validator to recognize subdomain blob hosts, localize the missing public question images, and scan question detail shards as well as the top-level question bank.
- Tightened the streak freeze reconciliation logic so it can bridge whole skipped-day gaps and preserve an active streak when the user returns after a one-day pause.
- Gave the Mock Test selection/setup screens a denser premium treatment with clearer selected states, cleaner controls, and better responsive spacing.

### Fixed
- Fixed `MockTestQuestion.jsx` option rendering to prevent duplicates by deduplicating options extracted from the stem.
- Fixed `MockTestContext.test.jsx` and `MockTestFlow.test.jsx` fixtures so mock questions include valid options and answer records, preventing timeouts under the new stricter pool validation.
- Fixed the Aptitude Direct-Link cold-start race-condition in `aptitudePreference.js` and `FilterContext.jsx` by synchronously initializing the in-memory index preference from the URL path.
- Aligned E2E tests in `practice-flow.spec.js` and upgraded workflow actions to permanently fix GitHub Actions runner warnings and E2E test failures.
- Resolved the GATE 2009 Question 15 content mismatch note after verifying that the regular expression corresponds to option `C`.

### Verified
- `npm run build:public-artifacts`
- `node scripts/qa/validate-question-images.mjs`
- `node scripts/qa/validate-aptitude-data.js`
- `npm run typecheck`
- `npm run build`
- Full verification sweep: `npm run test:unit` (272 passing tests) and `npm run test:e2e` (17 passing Playwright tests) completed cleanly.

## 2026-05-29

### Added
- Added automatic Aptitude index activation in `FilterContext.jsx` so that direct links to Aptitude questions (e.g., starting with `/question/APT-`) automatically enable Aptitude mode on load, ensuring detail shards hydrate and render correctly without index-missing errors.
- Added comprehensive regex unescaping (`/\\+r\\+n/gi`, `/\\+n/gi`, `/\\+r/gi`) in `AptitudeQuestionService.js` to normalize multi-escaped JSON shards (like `\\\\r\\\\n` and `\\\\n`), resolving messy paragraph layouts and rendering clean typography for questions like `APT-RSN-8049` and `APT-RSN-7552`.

### Changed
- Replaced the asynchronous dynamic `import('./index.css')` inside `index.jsx` with a standard static `import './index.css';`, forcing the browser's native rendering pipeline to block layout paints until all CSS styles are fully loaded and active.
- Refactored the static HTML loading splash screen (`#app-splash`) to be dismissed inside a top-level `useEffect` in `App.jsx` rather than immediately after scheduling `root.render`. Using a two-tier `requestAnimationFrame` delay ensures the React component tree is fully mounted and styled before the splash screen fades out, completely eliminating Flash of Unstyled Content (FOUC).
- Restored base-agnostic Vite compilation paths in `index.html` for preloads and manifests (e.g. `/manifest.webmanifest` and `/question-bank-manifest.json`), eliminating double base-path warning errors on startup.
- Implemented predictive route preloading in `routePreload.js` and `App.jsx` to prefetch chunk files on hover/focus over Home dashboard cards.
- Integrated `content-visibility: auto` and `contain-intrinsic-size` in `index.css` to restrict layout-recalculation costs for repeated list cards.

### Verified
- Local development server start verified and clean checkouts confirmed.
- Verified smooth transition from static HTML splash screen to fully-styled home page dashboard layout.
- Verified that direct URLs to visual/inequality reasoning questions (`APT-RSN-8049`, `APT-RSN-7552`) load immediately with beautifully parsed, clean typography.

## 2026-05-28

### Added
- Added `npm run aptitude:parse-pending`, a reusable aptitude intake runner that rebuilds pending-only catalogs from the current parsed artifact before parsing, so already parsed paper URLs are skipped automatically.
- Added `npm run aptitude:mark-paper-coverage`, which marks retried paper sets as covered when they contain only duplicate already-parsed questions or no structured rows, preventing endless pending retries.
- Added `npm run aptitude:dedupe-parsed`, which removes duplicate parsed aptitude rows using the same question-text dedupe key as the public build while merging source provenance into the kept row.

### Changed
- Hardened the aptitude scraper resume logic to skip already parsed papers using both runtime source URLs and normalized internal page URLs.
- Made the year-wise pending splitter consume local paper-coverage aliases so duplicate-content papers are excluded from future pending catalogs.
- Cleaned the local parsed aptitude staging artifact from 41,577 rows down to 36,836 unique rows, removing 4,741 duplicate-question rows before public artifact rebuild.
- Sanitized stale private-source provider labels from generated aptitude source metadata without hardcoding the provider label into tracked code.
- Added optional WebP recompression and max-side resizing controls to the aptitude image optimizer so the expanded aptitude image set stays within the public payload budget.
- Tightened the publisher-noise QA pattern to avoid false positives on legitimate learner text such as ordinary "book" and "publication" phrases.

### Verified
- `npm run aptitude:parse-pending -- --dry-run` confirmed the regenerated pending queue skips already parsed papers and leaves 48 pending paper sets.
- `npm run aptitude:parse-pending -- --max-runtime-minutes 180 --concurrency 2 --request-timeout 90000 --delay 1500 --checkpoint-every 5` retried all 48 remaining paper sets; the current structured parser accepted no additional rows, leaving staging at 41,577 parsed rows and 48 paper sets pending for manual/parser review.
- `npm run aptitude:mark-paper-coverage -- --input artifacts/aptitude-pipeline/leftovers-raw-2023.json --input artifacts/aptitude-pipeline/leftovers-raw-2024.json --input artifacts/aptitude-pipeline/leftovers-raw-2025.json --zero-debug-dir artifacts/aptitude-pipeline/debug-leftovers` marked 47 duplicate-content paper sets and 1 zero-structured-row paper set as covered.
- `npm run aptitude:parse-pending -- --dry-run` now reports 1,336/1,336 covered paper sets and 0 pending paper sets.
- `npm run aptitude:dedupe-parsed -- --write` removed 4,741 duplicate parsed rows from local aptitude staging.
- `python scripts/aptitude-pipeline/build_aptitude_db.py`, `npm run aptitude:mirror-images`, `APTITUDE_IMAGE_WEBP_QUALITY=40 APTITUDE_IMAGE_MAX_SIDE=640 node scripts/optimize-aptitude-images-webp.mjs --recompress-webp`, `npm run qa:validate-aptitude`, `npm run qa:verify-aptitude`, and `npm run qa:validate-aptitude-images` completed; image validation passed with 3,718 local images at 19.82 MB.
- Staging and public aptitude duplicate audits both reported 0 duplicate question groups.
- A tracked-file scan confirmed no private source labels, source URLs, or credential strings are present in repository-facing files.

## 2026-05-27

### Added
- Added a highly premium, beautiful **Prep Insights Quick Summary** panel to the High-Priority Topics page (`HighPriorityTopicsPage.jsx`), detailing top Rising, Cooling, Consistently Core, and High-Yield Focus topics to help students instantly see critical preparation priorities.
- Added support for mobile bottom navigation with the new "Priority" tab displaying the `FaFire` icon mapping directly to `HIGH_PRIORITY_TOPICS_ROUTE`.
- Added visible subtopic chips to the Solve question header, so aptitude questions now show the full context chain such as `Aptitude -> Reasoning -> Coding - Decoding -> MCQ`.
- Added a direct hamburger drawer `Filters` shortcut that opens the existing Explore filter UI.
- Added a sanitized year-wise aptitude pending-catalog splitter and parse-coverage report helper for verifying remaining intake by year without exposing private source labels in tracked files.
- Added direct filtered-practice quick start from Explore, including the mobile-friendly `Start Reasoning Practice` / `Continue Filtered Practice` path from active filters.
- Added focused efficiency guard coverage for session prefetching, persistent random-topic memory, cached filtering metadata, aptitude tag caching, and quick-start navigation.

### Changed
- Re-evaluated and balanced topic frequencies and rankings in `highPriorityTopics.js` to combine historical baselines with actual live question bank index counts dynamically, keeping all stats 100% data-driven.
- Replaced absolute marks-based trend calculation with a relative + absolute trend ratio to remove subject weight bias (e.g. preventing small-syllabus areas like CD/Digital Logic from being locked into flat trends).
- Optimized mobile layout for the High Priority Topics page: wrapped mobile line charts in a responsive height container (`h-[180px]`), restructured mobile detail overlays to be scroll-safe (`max-h-[90vh] overflow-y-auto`) to avoid clipping, and scaled the subject charts to be clean and legible.
- Changed Explore question opening to start a balanced random practice session from the filtered pool while keeping the selected question first.
- Replaced practice randomization with a standard stratified shuffle-bag algorithm: Fisher-Yates within each topic, weighted-fair interleaving across subject/subtopic strata, and a short topic cooldown to reduce clustering.
- Improved session efficiency by prefetching the next few likely question details in ordered/random practice and persisting a short recent-topic memory so reopened random practice avoids immediate same-subtopic starts.
- Optimized filter performance by caching normalized per-question filter metadata, using UID lookup maps, avoiding repeated answer/type resolution during filter updates, and preventing filter-time mutation of question objects.
- Precomputed aptitude structured tag and subtopic maps during aptitude index load so aptitude filter flows reuse cached maps instead of rebuilding them.
- Memoized Explore page result slicing/open handlers and the question picker list to reduce unnecessary render work while preserving the paginated layout.
- Upgraded the mobile Home action area into a centered horizontal carousel with partially visible side cards, scroll snapping, active-card emphasis, and compact dots while leaving desktop layout unchanged.

### Verified
- `node scripts/aptitude-pipeline/split-pending-catalog-by-year.mjs ...` (wrote ignored local year-wise pending catalogs and a sanitized coverage report)
- One-paper 2020 parser smoke pass completed with no new rows, leaving that paper pending for manual/parser review.
- `npm run test:unit` (passed, 43 files, 257 tests)
- `npm run build` (passed, production bundle built successfully; HighPriorityTopicsPage bundle: 114.50 kB)
- `git diff --check -- src\components\Practice\QuestionPickerList.jsx src\contexts\SessionContext.jsx src\contexts\SessionContext.test.jsx src\contexts\FilterContext.jsx src\contexts\FilterContext.test.jsx src\services\AptitudeQuestionService.js src\services\AptitudeQuestionService.test.js src\pages\ExplorePage.jsx src\pages\ExplorePage.test.jsx docs\CHANGELOG.md` (passed with only CRLF warnings)

## 2026-05-26

### Added
- Implemented the image-heavy aptitude intake pass to allow visual reasoning, Venn diagram, and mirror/series questions into the platform.
- Expanded the parser, mirroring, and validation checks in `mirror-aptitude-images.mjs` and `validate-aptitude-images.mjs` to recursively inspect `options[]` HTML as well as `questionHtml`.
- Enabled text-only filtering for forbidden string patterns to prevent false-positives on image URLs containing vendor terms.
- Added parser/classifier integration unit tests in `scrape-aptitude.test.mjs` to guard remote-image rendering structures.
- Added a full-screen HomePage readiness overlay that keeps the dashboard hidden until window load, fonts, and paint frames are ready, then fades out smoothly.

### Changed
- Scaled Aptitude Bank from `16,873` to `19,105` high-quality public questions, adding `2,232` newly parsed and accepted aptitude questions (Quant: `7,680`, English: `6,062`, Reasoning: `5,363`).
- Replaced the top quick-actions grid on the Home Page with an elegant horizontal flow, stretching the Practice card to match the Streak Banner size exactly.
- Repositioned study quotes to render inside the far-right section of the primary Practice card with left-border spacing.
- Styled Global Navigation Drawer with a solid theme-surface background, elevated drop shadows, right borders, and slide-in transition physics to eliminate transparent bleeding and double logo overlaps.
- Compacted the Mock Test Results and Insights Mock History overview UI with denser score/time blocks, smaller summary chips, tighter spacing, and shorter review sections.
- Implemented a mobile UI pass for the HomePage: converted the four action cards into a compact horizontal scroll-snap deck for mobile screens, retaining the grid layout on desktop.
- Enhanced the mobile Practice experience: improved header spacing, added a full-width filter trigger, horizontally scrollable chips, card-like mobile question rows, stacked pagination, and enforced global horizontal overflow locking.
- Enhanced Mock History dark mode to be fully theme-aware across timing rows, empty state, charts, attempt cards, and tooltips in `MockHistoryPanel.jsx`.
- Expanded CSV export to include GATE practice, Aptitude practice, and mock-test question history in `workspaceFile.js`.
- Added CSV test coverage for the combined export in `workspaceFile.test.js`.
- Verified clean-checkout import safety for FEAT-013 is retained and passes build and e2e suites.

### Removed
- Removed the unstable hover/focus popup tooltips from Home streak stats for Best, Aura, Freeze, and Days while keeping the stat pills visible.
- Removed direct `html2canvas` dependency from `package.json` and `package-lock.json` (now only an optional transitive dependency for jsPDF).

### Verified
- `npm run test:unit` (passed, 43 files, 250 tests)
- `npm run build` (passed, Exit code: 0)
- `npm run test:e2e` (passed, 17 tests)
- `npm run qa:a11y:axe` (passed, 3 tests)
- `npm run qa:validate-data` (passed with existing non-failing coverage warning)
- `npm run qa:validate-bundle-budget` (passed)
- `npm run qa:validate-landing-network` (passed)
- `npm run qa:validate-public-parity` (passed)
- `npm run lighthouse:mobile` (passed)
- `npm run qa:validate-aptitude` (passed, `19,105` rows)
- `npm run qa:validate-aptitude-images` (passed, 100% local references)
- `git diff --check -- src\components\Home\StreakBanner.jsx src\index.css src\components\Insights\MockHistoryPanel.jsx src\components\MockTest\MockTestResults.jsx` (passed)
- `git diff --check -- src\pages\HomePage.jsx src\index.css` (passed)
- `git diff --check` (passed with only CRLF warnings for the mobile UI pass)
- Note: Other modified files (Home/UI files, docs, generated public artifacts) remain in the worktree untouched to isolate these specific fixes.
- Full unit/build suites were not rerun for the final UI passes alone because the project instructions say to skip them unless explicitly requested.

## 2026-05-25

### Changed

- Restructured navigation drawer: removed nav tiles, merged Workspace into Tools (Export PDF/CSV/JSON, Import JSON).
- Moved hamburger button from left to right side of header.
- Rewrote PDF export as a 2-page jsPDF vector infographic progress report (replaces `html2canvas` screenshots).
- Added CSV progress export (`saveWorkspaceCsv`).
- Retired `.gateqa` file format — standard `.json` for all backups.
- Added per-tool "last used" timestamps, backup reminder card (≥7 days), and info popup.
- Added in-drawer Quick Reference glossary (Streak, Best, Aura, Freeze, Days).
- Removed User Manual link from footer (now in drawer only).
- Fixed Save Reminder and Info popup text colors for dark/light theme safety.
- Fixed Activity Heatmap month label collision on short rolling boundaries.

### Verified

- `npm run test:unit` (`41` files, `238` tests)
- `npm run build`

## 2026-05-20

### Changed

- Rebuilt the public aptitude bank around the AptitudeBank-only intake path: `16,873` English, Quant, and Reasoning questions across `60` subject/subtopic shards.
- Added a shared aptitude attempt/ignore gate so low-signal, duplicate, unsupported, invalid, brittle-image, synthetic, and non-aptitude rows are filtered before public artifacts are written.
- Mirrored public aptitude images into `public/images/aptitude/` and validated that public aptitude data has no remote or broken image references.
- Added the public user manual route at `/manual` and linked it from the footer.

### Removed

- Retired the legacy local aptitude PDF/OCR intake path and deleted the old PDF/OCR helper scripts.
- Removed stale one-off planning/design docs and generated review snapshots from version control.
- Made `artifacts/review/` local-only via `.gitignore` so future QA reports do not clutter GitHub.

### Verified

- `npm run qa:validate-aptitude`
- `npm run qa:verify-aptitude`
- `npm run qa:validate-aptitude-images`
- `npm run test:unit -- --testTimeout=15000` (`40` files, `233` tests)
- `npm run build`
