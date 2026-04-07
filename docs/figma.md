# GateQA UI / UX Architecture for Figma

This document outlines the UI structure, component hierarchy, and design philosophy of the **GateQA** platform. It serves as a guide for mapping the existing React UI into Figma mockups, design systems, and prototypes.

## 1. Global Shell & Layout System

The platform uses a layered shell architecture. At the top level, there are global UI wrappers, and specific environments have their own layouts.

### Main Wrappers
- **Header:** Contains navigation, platform branding, global controls (e.g., open calculator widget, filter access).
- **Footer:** Contains links to privacy policies, terms, and support modals.
- **Calculator Widget:** A floating/togglable scientific calculator accessible from the header or specific pages. Always stays on top when active.
- **Toast Notifications:** Ephemeral global feedback messages (e.g., "Saved to Bookmarks", "Answer submitted").

### Specialized Shells
- **Practice Shell:** Wrapper for all exploratory and practice tasks (`/practice` routes). Loads the full shell (Header + Footer) and standard navigation paths.
- **Mock Shell:** An isolated environment (`/mock` routes) designed to simulate the real exam layout. It operates in two stages:
  - **Setup Stage:** Full shell, showing instructions and test readiness.
  - **Exam Stage:** Strict locked-down shell (often removing standard navigation/footer to maximize focus, displaying countdown timers and a specialized sidebar).

---

## 2. Primary Screens & User Flows

When creating Figma artboards, group the designs into these core screens:

### Landing & Home Dashboard (`HomePage.jsx`)
The entry point of the app, designed to be lightweight and fast.
- **Hero/Header Section:** Welcoming the user.
- **Mode Selection Cards:**
  - **Resume Practice:** CTA to continue the last session (only visible if progress exists).
  - **Random Practice:** CTA to jump into a random set of fresh questions.
  - **Explore Practice:** Opens the `ExplorePage` to filter by topics.
  - **Start Mock Test:** Enters the Mock Test portal.
  - **Mock History:** Quick link to past mock results.
- **Progress Summary:** (Optional) High-level stats on questions solved and bookmarked.

### Practice Explore (`ExplorePage.jsx`)
The primary search and filter dashboard.
- **Active Filter Chips:** Horizontal scrolling or wrapping list of currently applied filters (Years, Subjects, Subtopics).
- **Question Layout Grid:** A list/grid of question preview cards.
- **Search Bar:** Input field to search question text dynamically.
- **Empty States:** Clear messaging when no questions match the current filters.

### Solve Workspace (`SolvePage.jsx`)
The focused workspace for solving a single question.
- **Question Card (`Question`):** Shows the question text, images, options (for MCQs/MSQs), or input fields (for NAT). Rendered with MathJax styling.
- **Question Status Controls:** Toggles for "Bookmarked", "Marked as Solved".
- **Answer Panel (`AnswerPanel`):** Expandable/Collapsible panel that reveals the correct answer and explanations.
- **Navigation Controls:** "Previous" and "Next" buttons. If the filtered queue is exhausted, an *Exhaustion Banner* appears notifying the reshuffle.

### Mock Test Experience
- **Setup Portal:** A pre-exam screen listing instructions, syllabus selection (if any), and a "Start Test" CTA.
- **Exam Interface:** 
  - **Main Area:** The current question.
  - **Sidebar:** A palette of question numbers (color-coded by state: Unanswered, Answered, Marked for Review). 
  - **Top Bar:** Exam timer (countdown) and "Submit Exam" button.
- **History & Analysis (`MockHistoryPage.jsx`):** Post-exam dashboard showing score, accuracy, time taken, and a detailed breakdown of correct/incorrect questions.

---

## 3. Reusable UI Components (Design System Library)

These components should be created as **Reusable Components** in Figma.

### Data Input & Filtering (`FilterModal`)
- **Filter Sidebar/Modal:** The master control panel containing accordion or list sections for:
  - **Year Filter & Range:** Dropdowns or sliders for selecting GATE years.
  - **Topic Filter:** Checkboxes/toggle lists for Subjects and Subtopics.
  - **Type Filter:** Toggles for MCQ, MSQ, NAT.
- **Progress Filter Toggles:** "Hide Solved", "Show Only Solved", "Show Only Bookmarked".

### Question Interactions
- **Radio Buttons / Checkboxes:** Used for MCQ and MSQ. Needs clear selected vs. unselected vs. hover states.
- **NAT Input Field:** Numerical formatting input field.
- **Math Content Block:** Placeholder styles for mathematical equations (rendered via MathJax).

### Progress & Status
- **Progress Manager Bar:** Visual representation of completion (e.g., Progress bar).
- **Status Badges/Pills:** e.g., `Solved`, `Bookmarked`, `MCQ`, `2024`.
- **Loading States (`Loaders`):** Skeleton loaders for question cards (`RouteLoader`, `MockCatalogLoaderCard`) and spinners for data fetching.

### Buttons & Typography
- **Primary / Secondary / Tertiary Buttons:** Standardized hover, active, disabled states.
- **Typography:** Clear hierarchy (H1..H6, Body, Caption). Distinguish between mathematical text (serif/LaTeX style) and UI text (sans-serif).

---

## 4. Visual Language & Variables

*Base your Figma local variables / design tokens on these inferred concepts from the codebase:*

- **Colors:**
  - `var(--color-bg)`: Main application background (likely a faint off-white or soft gray).
  - `var(--color-border)`: Used for card borders and separators.
  - Interaction states: Brand primary color (for CTAs, selected tags), Success green (correct answer), Error red (incorrect answer), Status colors (solved/bookmarked).
- **Spacing & Layout:**
  - Standardized paddings (e.g., `px-4 py-10 sm:px-6 lg:px-8` is common in Tailwind wrappers).
  - Max widths for content readability (e.g., `max-w-7xl`).
- **Elevations (Shadows) & Borders:**
  - `var(--shadow-card)`: Card drop shadows.
  - `var(--radius-card)`: Global border radius for structural cards.

## 5. Prototyping Workflows

Key workflows to represent in Figma prototypes:
1. **The Navigation Matrix:** Home $\rightarrow$ Explore $\rightarrow$ Solve $\rightarrow$ Global Calculator Toggle.
2. **The Filter Loop:** Open Filter Modal $\rightarrow$ Select Topic + Range $\rightarrow$ View Active Filter Chips $\rightarrow$ Clear Filters.
3. **The Mock Test Lockdown:** Home $\rightarrow$ Mock Setup $\rightarrow$ Mock Exam (Notice removal of main header/footer during exam) $\rightarrow$ Submit Exam $\rightarrow$ Mock History.
