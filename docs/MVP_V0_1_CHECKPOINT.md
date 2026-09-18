# Saving Lia MVP v0.1 candidate — local checkpoint

Frozen scope: local React/TypeScript/Vite demonstration; no production integration.

Final validation on 2026-09-18: 7 tests passed, TypeScript passed, production build passed, git diff --check passed. Desktop 1440 × 900 and mobile 390 × 844 smoke checks covered Dashboard, New Order, Review, Confirmation and Driver Preview. Mobile sticky clearance and horizontal overflow checks passed. Demo data restored to the original three orders after checks.

The final review spacer uses ResizeObserver with border-box observation to reserve the action bar's measured height (including safe-area padding), plus 16px. Clearance passed at 360 × 800, 390 × 844 and 430 × 932, including an additional simulated 32px bottom inset. Desktop spacing remains unchanged.

## Commit inventory

Application: index.html, package.json, package-lock.json, tsconfig.json, src/ (UI, styles, domain, repository, fixtures and tests), .gitignore.

Documentation: README.md, docs/VERIFICATION.md, docs/MOBILE_UX_VERIFICATION.md and this checkpoint record. Earlier context/scope/decisions/demo documentation remains in its separate checkpoint commit.

Excluded local-only paths:
- .env.local — local credential material; never included.
- .vercel/project.json, .vercel/README.txt, .vercel/output/config.json, .vercel/output/static/index.html — machine-local link and obsolete connectivity-test build output.
- supabase/.temp/cli-latest, gotrue-version, linked-project.json, pooler-url, postgres-version, project-ref, rest-version, storage-migration, storage-version — CLI link/version/connection cache. All names after the first share supabase/.temp/.
- node_modules/ — installed dependencies, reproducible from the committed lockfile.
- dist/ — generated production output, reproducible with npm run build.
- artifacts/ — QA screenshots, PDFs, rendered print checks and local exclusion inventory. QA documents reference these as local evidence; they are deliberately not versioned.

The exact per-file excluded inventory is available locally at artifacts/checkpoint-exclusions.txt. That inventory itself is ignored.

No application credentials, live customer export, generated screenshots or machine-local metadata belongs in this commit. Preserve cc89f1e and 7e82fab as separate ancestors. Push only codex/mvp-demo-2026-09-18; no main merge/push and no deployment.
