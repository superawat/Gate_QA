---
name: baseline-ui
description: "Use when doing ANY UI, layout, styling, Tailwind CSS, or component work. Enforces high information density, tabular numbers, responsive safe areas, sub-200ms interactions, and eliminates AI slop like gratuitous gradients and glowing borders."
metadata:
  author: ibelick
  version: "1.0.0"
---

# Baseline UI

Enforces an opinionated UI baseline to prevent AI-generated interface slop, maximize information density, and ensure an ergonomic, high-performance study workstation.

## General Principles & Information Density

- **Full Screen Utilization:** Prioritize multi-column split views and dense layouts over giant, empty side gutters (`max-w-7xl` boxes) on wide displays.
- **Zero-Friction Actions:** Favor inline controls, keyboard shortcuts, and visible data over nested menus and modal dialogs.
- **Minimal Cognitive Overhead:** Keep key status indicators (question types, marks, review status, accuracy) visible upfront without requiring extra clicks.

## Stack Conventions

- MUST use Tailwind CSS defaults unless custom theme tokens already exist or are explicitly requested.
- MUST use `cn` utility (`clsx` + `tailwind-merge`) for conditional class logic.
- MUST respect the project's CSS variables and design tokens (`var(--color-surface)`, `var(--color-border)`, `var(--radius-card)`).

## Components & Accessibility

- MUST add clear, descriptive `aria-label` and `title` attributes to all icon-only buttons (e.g. Home, Theme toggle, Delete).
- MUST use accessible component primitives for anything with keyboard or focus behavior.
- NEVER rebuild custom keyboard focus behavior by hand when established patterns exist.
- MUST use an `AlertDialog` or explicit confirmation step for destructive or irreversible actions (e.g. resetting progress).

## Interaction & Mobile Ergonomics

- NEVER use `h-screen`; use `h-[100dvh]` or `min-h-[100dvh]` to account for mobile browser URL bars.
- MUST respect `safe-area-inset` (`env(safe-area-inset-bottom, 0px)`) for fixed and sticky bottom navigation elements.
- MUST show error feedback directly inline next to where the action occurred.
- NEVER block paste into `input` or `textarea` elements.

## Animation & Motion

- NEVER add gratuitous animation unless explicitly requested.
- MUST animate only compositor properties (`transform`, `opacity`).
- NEVER animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- NEVER exceed `200ms` for interaction feedback.
- MUST respect `prefers-reduced-motion`.
- NEVER introduce custom jarring easing curves.

## Typography & Numbers

- MUST use `tabular-nums` for timers, question numbers, scores, accuracy percentages, and data tables to prevent layout jitter.
- MUST use `text-balance` for headings and `text-pretty` for body/paragraphs.
- SHOULD use `truncate` or `line-clamp` for dense lists and question titles.

## Visual Design & Anti-Slop Rules

- NEVER use generic purple or multi-color rainbow gradients.
- NEVER use neon glowing box-shadows or border glows as primary affordances.
- Keep accent colors disciplined: limit to one dominant accent per view.
- Give every empty state at least one clear, primary next action.
