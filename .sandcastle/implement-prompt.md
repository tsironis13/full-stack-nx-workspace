# TASK

Fix issue #{{ISSUE_NUMBER}}: {{ISSUE_TITLE}}

Pull in the issue using `gh issue view`, with comments. If it has a parent PRD, pull that in too.

Only work on the issue specified.

Work on branch {{BRANCH}}. Make commits, run tests, and close the issue when done.

# CONTEXT

Before writing or moving code, **read and follow** these workspace architecture contracts (they override ad-hoc folder choices):

- **Angular (ecommerce app):** `docs/front-end-infrastructure.md` — DDD folders under `apps/ecommerce/src/app`, `eslint-plugin-boundaries` element types, **HTTP only in `domains/<domain>/infrastructure/`** with **wire/API models** in `infrastructure/*.model.ts` (**no imports from `domain/`**), **map wire → domain** in `application/`, **NgRx Signal Store** in `application/`, `public-api.ts` barrels.
- **NestJS (ecommerce-api):** `docs/nestjs-architecture.md` — feature modules under `apps/ecommerce-api/src/modules/<feature>/` with **`presentation/`**, **`application/`**, **`domain/`**, **`infrastructure/`** slices (no single-folder “products” dump).

If a PRD or issue conflicts with these docs, **call out the conflict** and align the implementation with the docs unless the issue explicitly updates the architecture.

Here are the last 10 commits:

<recent-commits>

!`git log -n 10 --format="%H%n%ad%n%B---" --date=short`

</recent-commits>

# EXPLORATION

Explore the repo and fill your context window with relevant information that will allow you to complete the task.

Pay extra attention to test files that touch the relevant parts of the code.

# EXECUTION

If applicable, use RGR to complete the task.

1. RED: write one test
2. GREEN: write the implementation to pass that test
3. REPEAT until done
4. REFACTOR the code

# FEEDBACK LOOPS

Before committing, run `npm run typecheck` and `npm run test` to ensure the tests pass.

# COMMIT

Make a git commit. The commit message must:

1. Start with `RALPH:` prefix
2. Include task completed + PRD reference
3. Key decisions made
4. Files changed
5. Blockers or notes for next iteration

Keep it concise.

# THE ISSUE

If the task is not complete, leave a comment on the GitHub issue with what was done.

Do not close the issue - this will be done later.

Once complete, output <promise>COMPLETE</promise>.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
