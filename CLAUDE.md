@AGENTS.md

## Project: Daily Snacks

Internal Next.js 16 app for Medigene IT (10–20 people) to pick daily office snacks. Setup, menu rules, deploy
and troubleshooting are documented in `README.md` (Bengali). Read the relevant section before changing behavior,
and update README when behavior, scripts, schema or project structure change.

### Commands

- `npm run dev` / `npm run build` / `npm run lint`
- `npm test`: `node --test` on `tests/*.test.ts` against an in-memory DB. Run it after any change to `lib/menu.ts`.
- `npm run db:migrate`: applies new files in `db/migrations/` (reads `.env` and `.env.local`).
- Node ≥ 22.18 runs the `.ts` files in `scripts/` and `tests/` directly; no `tsx`/`ts-node`.

### Hard constraints (ask before changing)

- Stack: App Router + TypeScript, `@libsql/client` with raw SQL (no ORM), own auth (`bcryptjs` + DB sessions +
  httpOnly cookie, no auth library), Tailwind, zod. No realtime, cron or external services.
- No new dependencies without asking.
- All UI text and error messages are Bengali. Category keys are `healthy`/`unhealthy` in code; screen labels come
  from `lib/constants.ts`.

### Code rules

- Always parameterized SQL (`sql` + `args`). Writes that must succeed together go in `db.batch([...], "write")`,
  not interactive transactions (a pooled connection may not have `PRAGMA foreign_keys` on).
- All menu, selection, guest and leave rules live in `lib/menu.ts`. Mutations return `string | null` (Bengali error
  or `null`). Each write re-checks its preconditions (status, cutoff, leave…) inside the SQL `WHERE`, so a race
  cannot slip past the TypeScript check. Keep this pattern for new writes, and add a test in `tests/menu.test.ts`.
- `lib/menu.ts` and the lib files it uses import each other as `./x.ts`, not `@/lib/...`, so Node can run them
  in tests and scripts.
- Every page and Server Action starts with `requireUser()`/`requireAdmin()` (`lib/auth.ts`). `proxy.ts` (Next 16's
  name for middleware) only checks that the cookie exists.
- No cron: menus close lazily through `ensureClosedIfPastCutoff()` / `closeExpiredMenus()` before reads and writes.
- Times are stored as ISO 8601 UTC; display and default cutoff use Asia/Dhaka (`lib/time.ts`).
- Migrations: add a new numbered file in `db/migrations/`; never edit one that has already run.
- Shared UI lives in `components/ui.tsx` (`containerClass`, colors, cards, buttons). Number inputs spread
  `numberInputProps` from `components/form.tsx`.
- Don't write `.env*` files; tell the user what to add instead.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `get_minimal_context_tool` | First call for any task — compact overview and suggested next tools |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
