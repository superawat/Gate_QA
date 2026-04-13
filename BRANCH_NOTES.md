# Branch Strategy & Notes

## `main`
- **Purpose**: This is the stable, production-ready branch. 
- **Policy**: Avoid making direct, unreviewed or incomplete commits here. Changes should only be pushed or merged to `main` when they are fully tested and ready to deploy.

## `feature/spring-2026-updates`
- **Purpose**: Created to house all the recent, uncommitted work rather than polluting the `main` branch. 
- **Contents**: Includes UI fixes, mock test improvements, Playwright test setup, data artifacts, `.md` roadmap updates, and script modifications.
- **Workflow**: Continue making your day-to-day saves on this branch. Once all tasks are stable and confirmed functional, this branch can be merged back into `main`.
