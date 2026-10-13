# Project Conventions

## README Maintenance

- Update `README.md` whenever a major change lands: new architecture,
  new directories (e.g. `web/` React frontend), new npm scripts, new
  API endpoints, new CI jobs, or deployment changes.
- Keep the Project Structure, Development, API Endpoints, Testing, and
  Deployment sections in sync with the actual repo state.

## Git Discipline

- Do NOT commit, merge, or push to `main` (or any branch) without
  explicit user approval. Stage changes and wait for the go-ahead.

## Frontend (web/)

- React 18 + Vite 5 + TypeScript + Tailwind 3 + Framer Motion 11.
- Verify with: `cd web && npx tsc --noEmit && npx eslint . --ext ts,tsx && npx vitest run && npm run build`.
- The Express server (`src/server.ts`) serves `web/dist/` in production
  with an SPA fallback; `public/` is the legacy fallback.
- Health page route is `/status` (the `/health` path is the API endpoint).
