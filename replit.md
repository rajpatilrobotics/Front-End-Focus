# ContextFirst Nexus

An AI-assisted case-preparation workspace for qualified legal and support practitioners working with possible trafficking-related forced-criminality cases. Helps practitioners understand what case records document, identify coercion indicators, and produce safe, source-grounded handoffs — with a human making every consequential decision.

## Run & Operate

- `pnpm --filter @workspace/nexus run dev` — run the frontend (port from `$PORT`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not yet configured; app runs in demo/fixture mode without it)

## Stack

- pnpm workspaces, Node.js, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nexus/` — React/Vite frontend (landing, case dashboard, timeline, trust & safety)
- `artifacts/api-server/` — Express 5 API server
- `artifacts/mockup-sandbox/` — Vite-based component mockup/design sandbox
- `lib/db/` — Drizzle ORM schema (source of truth for DB shape)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- Deterministic replay fixture bundled in the frontend — the app works as a demo without a live DB or AI provider.
- AI provider adapters are server-only; practitioners cannot choose or configure models.
- Evidence origin, nature, support status, and human-review state are kept as separate dimensions — never collapsed into a single score.
- Dependency graph: rejecting evidence automatically invalidates dependent findings and blocks export.

## Product

ContextFirst Nexus helps practitioners answer: what does the case packet actually document about the relationship between alleged conduct and possible coercion — and what needs human review before a safe handoff?

## User preferences

- Focus is on UI design, not backend functionality.

## Gotchas

- `DATABASE_URL` is required for the API server and DB push; the frontend demo runs without it.
- `PORT` and `BASE_PATH` env vars are injected automatically by Replit per artifact.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
