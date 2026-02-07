# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + React + TypeScript app for Ramadan journaling.

- `src/pages`: route-level screens (for example `DashboardPage.tsx`, `TrackerPage.tsx`)
- `src/components`: reusable UI and feature components (`ui/`, `dashboard/`, `layout/`, `demo/`)
- `src/hooks`: custom React hooks for app state and Supabase-backed flows
- `src/lib`: utilities, storage helpers, API clients, and domain logic
- `src/test`: test setup and test files
- `public`: PWA assets (`manifest.webmanifest`, icons, offline page)
- `supabase/migrations` and `supabase/functions`: database schema changes and edge functions
- `docs`: internal API documentation

Use the `@/` alias for imports from `src` (example: `import { cn } from "@/lib/utils"`).

## Build, Test, and Development Commands
- `npm install`: install dependencies
- `npm run dev`: start local dev server
- `npm run build`: create production build in `dist/`
- `npm run build:dev`: build using development mode
- `npm run preview`: preview the built app locally
- `npm run lint`: run ESLint on the codebase
- `npm run test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode

Run `npm run lint && npm run test && npm run build` before opening a PR.

## Coding Style & Naming Conventions
- Language: TypeScript + TSX, 2-space indentation, semicolons enabled.
- Components/pages/hooks: PascalCase files for components/pages, `useXxx.ts` for hooks.
- Keep feature logic in hooks/lib, keep UI components presentational when possible.
- Prefer alias imports (`@/...`) over deep relative paths.
- Follow ESLint config in `eslint.config.js` (React Hooks rules are enforced).

## Testing Guidelines
- Framework: Vitest with `jsdom` and Testing Library.
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` under `src/`.
- Put shared setup in `src/test/setup.ts`.
- Add tests for changed behavior (especially hooks, utilities, and critical page logic).

## Commit & Pull Request Guidelines
- Branch naming: `feat/<name>` or `fix/<name>`.
- Use clear, imperative commit messages (example: `feat: add fasting streak badge`).
- Avoid vague messages like `Changes`.
- PRs should include:
  - concise summary and motivation
  - linked issue/task when applicable
  - screenshots for UI changes
  - confirmation that lint, tests, and build pass
