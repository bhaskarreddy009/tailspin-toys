---
name: full-stack-development
description: Guides end-to-end feature development across UI, application logic, data, testing, security, and delivery. Tailored to this Astro 7 + Tailwind CSS + Drizzle/Node SQLite repository.
---

# Full-Stack Development

Use this skill for work that crosses more than one application layer or requires
an end-to-end implementation. Follow the repository instructions in
`.github/copilot-instructions.md` and the matching files in
`.github/instructions/` before changing code.

## 1. Start With the System

Before editing:

1. Read the relevant issue, request, or acceptance criteria.
2. Inspect the existing routes, components, data helpers, schema, tests, and
   configuration involved in the change.
3. Identify the complete flow:

   `user action -> page/component -> data helper -> database -> rendered result`

4. Search for existing helpers and patterns before introducing new ones.
5. State assumptions when the request leaves behavior or edge cases undefined.

Keep changes focused. Do not introduce a backend service, client framework,
third-party database driver, or dependency unless the repository explicitly
needs it.

## 2. Repository Architecture

This application is an Astro 7 site with static output:

- Pages, layouts, routes, and UI components are `.astro` files.
- Pages query data in frontmatter at build time.
- There is no runtime API server or client-side React/Vue/Svelte layer.
- Tailwind CSS v4 utilities provide styling.
- Drizzle ORM uses Node.js's built-in `node:sqlite` driver.
- `db/games.csv` is the seed source and `db/migrations/` contains generated
  migrations.

Preserve this architecture. A feature that needs persistence should normally
extend the schema, seed/transforms, data-access helpers, and statically
rendered pages rather than adding an API endpoint.

## 3. Frontend Development

- Use semantic HTML and native controls before custom interaction.
- Keep page data fetching in Astro frontmatter.
- Use `getStaticPaths()` and `prerender = true` for dynamic routes.
- Keep reusable UI in `src/components/` and shared document structure in
  `src/layouts/`.
- Use Tailwind utility classes exclusively for styling.
- Follow the dark slate palette and responsive mobile-first layout conventions.
- Add a descriptive `data-testid` to every interactive element.
- Provide visible focus states, keyboard support, useful labels, and appropriate
  ARIA only where native semantics are insufficient.
- Add client-side scripts only when real interactivity is required.
- Do not hide loading or error states; expose them with appropriate status or
  alert semantics when client behavior exists.

## 4. Data and Persistence

- Define database tables in `db/schema.ts`.
- After a schema change, run `npm run db:generate` and commit the generated
  migration.
- Keep CSV parsing and seed transformations pure in `db/transforms.ts`.
- Keep database access in typed helpers under `src/lib/`.
- Make data-access helpers accept an injectable `db` argument.
- Map database rows to app-facing types in one place; do not leak raw Drizzle
  join shapes into components.
- Use stable ordering for all collections used by static generation.
- Keep seed-derived values deterministic; never use `Math.random()`.
- Make seed operations idempotent and validate required relationships.
- Use the in-memory database helper for data-layer tests.

## 5. Input, Errors, and Boundaries

- Validate external input at the boundary before using it.
- Normalize identifiers and handle malformed or missing values explicitly.
- Return or render a clear not-found state for missing records.
- Do not add broad `try/catch` blocks or silent fallbacks.
- Propagate errors when the caller can handle them; otherwise surface a useful
  user-facing error consistent with existing UI patterns.
- Do not trust values from URLs, forms, cookies, or environment variables.
- Avoid exposing database details, credentials, stack traces, or sensitive
  implementation data in rendered output.

## 6. Security and Privacy

- Never commit secrets, tokens, private keys, or local database files.
- Keep secrets in environment variables and document required variable names
  without documenting their values.
- Validate and constrain user-controlled data before database queries or HTML
  rendering.
- Prefer parameterized Drizzle queries over string-built SQL.
- Escape or safely render content; do not add unsafe HTML injection mechanisms
  without a documented, reviewed reason.
- Use least-privilege permissions in GitHub Actions and external integrations.
- Review new dependencies for maintenance, licensing, and supply-chain risk.

## 7. Testing Strategy

Choose tests based on the changed layer:

| Changed area | Required coverage |
|---|---|
| Pure transforms | Vitest unit tests for valid, empty, malformed, and deterministic cases |
| Schema or data helpers | Vitest tests using `createTestDatabase()` and realistic relations |
| Astro pages/components | Playwright tests for visible content, navigation, and states |
| Interactive behavior | Keyboard and user-visible Playwright assertions |
| Accessibility-sensitive UI | Existing accessibility specs plus manual keyboard review |
| Build-time routing | E2E coverage for valid and not-found routes |

Follow these rules:

- Reuse existing test utilities and fixtures.
- Prefer behavior assertions over implementation details.
- Use accessible, role-based Playwright locators when possible.
- Use `data-testid` only when a stable semantic locator is not enough.
- Do not use `waitForTimeout`; use web-first auto-retrying assertions.
- Add tests for regression-prone edge cases, not just the happy path.
- Do not rewrite passing tests to avoid adding targeted coverage.

## 8. Verification Workflow

Use the `quality-checks` skill for test, lint, and quality execution. Select
checks based on the change, escalating to the full suite when layers interact:

- TypeScript or Astro changes: type-check and lint.
- Data-layer changes: type-check and unit tests.
- UI or route changes: type-check, lint, build, and E2E tests.
- Cross-layer changes: run the complete verification suite.

For UI changes, manually inspect the built or development page for:

- responsive layout,
- keyboard navigation and focus,
- empty, loading, error, and not-found states,
- links and route behavior,
- contrast and readable text.

## 9. Documentation and Delivery

- Update `README.md` when setup, scripts, architecture, or user-visible behavior
  changes.
- Update relevant `.github/instructions/` guidance when a new project convention
  is introduced.
- Keep commits focused and describe what changed and why.
- Use the repository issue and pull-request templates.
- Before opening a PR, use the PR Readiness agent when the change needs a full
  acceptance-criteria and browser-validation review.
- Never commit or merge to `main` automatically.

## 10. Completion Checklist

Before declaring an end-to-end change complete, confirm:

- The request is implemented across every affected layer.
- Existing patterns and injectable helpers were reused.
- Invalid input, empty data, missing records, and failures are handled.
- Required migrations and tests were added.
- Interactive UI has test IDs, semantic controls, and focus states.
- Documentation is updated where behavior or workflow changed.
- The appropriate quality checks pass.
- No secrets, generated local databases, or unrelated files were added.
