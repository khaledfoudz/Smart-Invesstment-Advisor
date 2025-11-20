# Copilot Instructions for Smart Investment Adv

## Project Overview
- **Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn-ui
- **UI Components:** Custom and shadcn-ui components in `src/components/` and `src/components/ui/`
- **State/Data:** Uses React state, hooks, and `@tanstack/react-query` for async data. Supabase integration in `src/integrations_supabase/`.
- **Routing:** Managed via `react-router-dom` in `src/pages/`.

## Key Directories & Files
- `src/components/` — Main React components (sections, layout, navigation)
- `src/components/ui/` — shadcn-ui primitives and custom UI elements
- `src/pages/` — Route-level React components
- `src/integrations_supabase/` — Supabase client and types
- `src/hooks/` — Custom React hooks
- `src/lib/utils.ts` — Utility functions
- `public/` — Static assets

## Build & Development
- **Install dependencies:** `npm i`
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Lint:** `npm run lint`
- **Preview build:** `npm run preview`

## Patterns & Conventions
- **Component Structure:** Prefer function components, colocate styles (CSS/TSX) in same folder.
- **UI:** Use shadcn-ui primitives for consistency. Extend in `src/components/ui/` if needed.
- **State:** Use hooks for local state, `react-query` for async/server state.
- **Forms:** Use `react-hook-form` and `zod` for validation.
- **Styling:** Tailwind CSS utility classes. Use `clsx` and `tailwind-merge` for dynamic classnames.
- **Type Safety:** Use TypeScript throughout. Types for Supabase in `src/integrations_supabase/types.ts`.
- **Assets:** Store images in `src/assests/` (note: typo, should be `assets/`).

## External Integrations
- **Supabase:** Client setup in `src/integrations_supabase/client.ts`. Types in `types.ts`. Use for auth and data.
- **Lovable Platform:** Project can be edited/deployed via [Lovable](https://lovable.dev/projects/b5e0772a-028d-41a7-b8ae-033c8427944c).

## Example Workflow
1. Add a new UI component in `src/components/ui/` using shadcn-ui pattern.
2. Create a page in `src/pages/` and route via `react-router-dom`.
3. Fetch data using Supabase client and manage with `react-query`.
4. Style with Tailwind CSS classes.

## Special Notes
- **No custom test setup detected.** Add tests if needed using your preferred React testing library.
- **Typo in `src/assests/` directory.** Use `assets/` for new files.
- **All build/lint commands are in `package.json` scripts.**

---

_If any section is unclear or missing, please provide feedback to improve these instructions._
