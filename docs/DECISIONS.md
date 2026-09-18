# Saving Lia — decisions and proposed implementation

## Established constraints

- Work on codex/mvp-demo-2026-09-18; preserve the existing connectivity page in a local checkpoint before replacement. Do not push.
- Document discovery before implementing. Architecture and implementation are now approved.
- No remote service changes, deployment, QuickBooks integration, or application authentication in this step.
- Keep financial invoices in QuickBooks; the demo produces confirmations and fulfillment summaries only.
- Local persistence is acceptable; repository/integration boundaries must support later replacement.

## Approved frontend choice

**Recommend React + TypeScript + Vite as a client-only application**, with plain CSS, native browser printing, and a small repository interface. No router package, global state library, UI kit, server, or Next.js runtime is needed for the first demo.

| Approach | Today's demo | Later integrations | Maintainability / existing Vercel |
| --- | --- | --- | --- |
| Vanilla HTML/CSS/JS | Least setup; good for the existing static page | Repository abstraction is possible | Coordinating editable orders, multiple previews, and state adds manual DOM work; no build required |
| React + TypeScript + Vite | Small initial setup; reusable controls and shared state suit these views | Typed repository and explicit integration boundary can later support Supabase and a bridge service | Clear components and data types; static dist output. Existing Vercel project's previously observed Next.js preset requires review before any future deployment |

The extra build setup is justified by the coordinated views, editable line items, and consistent printable documents. This is an architectural recommendation, not a framework requirement established by discovery. Dependency installation is now approved. Pin selected dependency versions and commit a lockfile when implementation is authorized.

## Proposed structure

- App owns selection/navigation and order state; views do not directly access localStorage or remote SDKs.
- Domain types preserve requested quantity, confirmed quantity, supplied price facts, notes, availability, and source provenance separately. Missing values remain distinguishable from zero.
- Order repository exposes list/get/save/reset operations using an asynchronous interface. A versioned localStorage adapter is the only initial implementation. Handle storage failure visibly.
- Seed fixtures retain confirmed source facts; missing details stay unresolved until an explicit demo-data decision.
- Shared domain selectors produce consistent preview data. Money uses explicit decimal-safe handling; supplied prices do not establish an unapproved general pricing policy.
- Ready for QuickBooks is only a demo handoff marker. A future bridge adapter may receive a handoff payload, but this MVP sends nothing and creates no real invoice.
- Authentication and real server-side authorization are future work; UI role labels are not security enforcement.

## Proposed files

Create:

```text
package.json
package-lock.json
tsconfig.json
vite.config.ts
src/main.tsx
src/App.tsx
src/styles.css
src/domain/order.ts
src/domain/order.test.ts
src/data/demoData.ts
src/data/orderRepository.ts
src/data/localOrderRepository.ts
src/data/localOrderRepository.test.ts
src/components/OrderEntry.tsx
src/components/OrderQueue.tsx
src/components/OrderReview.tsx
src/components/ConfirmationPreview.tsx
src/components/DriverPreview.tsx
```

Replace after approval: index.html, turning the checkpointed test page into the frontend entry point.

Modify after approval: README.md (run/build/demo instructions), .gitignore (node_modules/dist exclusions), and these docs as decisions are resolved. Preserve Supabase/Vercel linkage and environment files. No Supabase migration or Vercel deployment configuration change is planned now.

## Proposed implementation sequence

1. Obtain approval of architecture and resolve missing demo quantities/prices, unit labels, and status behavior. Mark any agreed synthetic fixtures explicitly.
2. Scaffold the frontend and establish domain types, source-aware fixtures, and local repository.
3. Implement order entry and queue, then review with preserved requested quantities, discount display, O/S, and partial fulfillment.
4. Implement confirmation and both print views using the same confirmed order data; add the QuickBooks boundary messaging.
5. Apply responsive styling, keyboard support, storage error handling, and explicit demo reset.
6. Verify meaningful state/data invariants, persistence, expected scenario prices, and browser/print flows against MVP_SCOPE.md. Run type-check, tests, and build. Stop before deployment/push unless separately authorized.

## Open decisions — do not silently invent

- Are explicit synthetic quantities allowed for H-Mart/Bestco? What price treatment should unknown Bestco items use?
- What are the fixed selling-unit labels? Which order fields are required?
- Which editing actions set Needs Review? Does confirmation also set Ready for QuickBooks, or is readiness a separate marker/action? Can confirmed orders reopen?
- How should demo discounts be edited and rounded beyond the observed examples? Which limited pricing behavior is actually needed?
- What customer/driver fields and delivery notes should be shown, and what printing layout is preferred?
- Is an in-browser proxy/customer toggle sufficient? There is no real notification, separate authenticated user, or multi-device delivery.
- Production tax, pricing precedence, authorization, retries, invoice numbering, and bridge synchronization remain future requirements, not assumptions.

## Approved implementation addendum — 2026-09-18

The implementation instruction supersedes earlier planning uncertainties:
- React, TypeScript, Vite, plain CSS, repository-isolated localStorage, and browser printing are approved. Default landing view is Lia's dashboard.
- STN2001 description: Sea Tangle - Kelp Noodles 340g x12; quantity 5, unit price $66.00, total $330.00, Net 30.
- H-Mart quantities are 1 each. PP40786: Fettuccine Style Noodle 100g x 12; PP40787: Spaghetti Style Noodle 100g x 12; PP41304: Cooked Soybean Sprout 300g x 20. Previously supplied prices/discounts remain verified; historical total $161.15.
- PN100095: San Sui Tofu-Soft - 425g x12. PN100096: San Sui Tofu-Firm - 425g x12. Historical O/S lines had quantity 0, unit price $0.00 and total $0.00. This does not establish their normal list price.
- Bestco requested quantities remain unknown. Demo-only requested values are explicitly authorized with source: demo and historicalRequestedQtyKnown: false.
- Conservative demo choices: saving review sets Needs Review; confirmation sets Confirmed and opens preview; an explicit Ready for QuickBooks action marks readiness without transmitting anything. Confirmed orders are read-only in this slice.
- Demo percent calculations round half-up to cents; this is not a production pricing policy. Unknown normal prices block positive confirmed quantity for the two O/S-only products.
- New order requires customer, at least one product, and positive whole selling-unit quantities as demo input constraints. PO and notes are optional; no claim is made about production validation rules.
- Implement and verify now. Commit documentation only; leave implementation uncommitted. No pushes, deployments, remote writes, or external integrations.
