# Practice Redesign Wireframe Brief

This document is the repo-side handoff for the Home / Explore / Solve redesign.
It mirrors the Figma scope from the implementation plan so a designer can turn it into screens and a clickable prototype without re-deciding flows.

## Figma Pages

- `Sitemap`
- `Wireframes`
- `Components`
- `Prototype`

## Required Frames

Create each frame at desktop `1440` and mobile `390`.

- Home default
- Home with resume card
- Explore default
- Explore with mobile filter drawer open
- Explore with populated results
- Explore no-results state
- Solve default
- Solve loading state
- Solve error state
- Solve after answer submission

## Prototype Flows

- `Home -> Random Practice -> Solve`
- `Home -> Explore -> Result -> Solve`
- `Home -> Continue -> Solve`
- `Solve -> Back to Results`
- `Solve -> Share deep link`

## Component Inventory

- Global header with Home / Explore / Continue actions
- Stat card
- Primary CTA card
- Filter drawer
- Desktop filter rail
- Result card
- Pagination controls
- Solve metadata chip row
- Question action bar

## Usability Review Checklist

- First question is reachable within two primary actions from Home.
- Explore filters are understandable without prior product context.
- Mobile filter drawer keeps focus trapped and returns focus to the trigger on close.
- Solve page keeps previous, next, share, solved, bookmark, and submit actions visible without hunting.
- Back to Results preserves filter and page context.
