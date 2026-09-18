# Saving Lia

Natusoy's local order-operations MVP: customer/proxy entry → Lia's queue → quantity and discount review → confirmation → customer and driver print views → Ready for QuickBooks.

## Run locally

Use Node.js 24 (verified with 24.12.0) and npm:

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Open http://127.0.0.1:5173. The dashboard seeds three orders on first use. Reset Demo Data requires confirmation and restores the original fixtures. No environment variables or remote credentials are required by the app.

## Verify

```sh
npm test
npm run typecheck
npm run build
git diff --check
```

Vite emits static assets to `dist/`. This does not deploy anything. Existing Vercel/Supabase linkage is preserved; the earlier `.vercel/output` connectivity-test artifact is not the application build and must not be used to deploy this MVP.

## Demo flow

- Dashboard: open a seed order or select New Order. New orders appear in the queue.
- Review: edit confirmed quantities, discounts, availability and notes. Save review sets Needs Review. Requested quantities are preserved.
- Confirm Order: persists Confirmed and opens Order Confirmation. Confirmed orders are locked in this slice.
- Preview: print either customer confirmation or driver summary. Mark Ready for QuickBooks changes only local status; it sends nothing.
- Refresh returns to the dashboard with saved orders intact. Unsaved edits prompt before navigating away.

## Data boundaries

React components use an asynchronous OrderRepository interface. Only `src/data/localOrderRepository.ts` accesses localStorage, using the versioned key `saving-lia.orders.v1`. This is single-browser demo storage, not a secure production database or multi-user synchronization. Do not enter private customer information. Browser storage errors are surfaced rather than claiming a successful save.

The seed data uses the supplied Healthy Planet, H-Mart and Bestco examples. Bestco requested quantities of 5 are **synthetic demo values**, with explicit provenance metadata and visible labels. Its observed O/S price of zero is not a known normal selling price: positive confirmed quantities for these two products are blocked until real prices exist.

Demo discounts use percentage calculations rounded half-up to cents. New orders do not automatically inherit customer discounts. No production pricing precedence, tax, automatic backorder, inventory synchronization, authentication, email, payment, or QuickBooks integration is implemented. Subtotals are not invoice totals. Historical invoice references identify discovery sources only.

## Layout

- `src/domain/`: types, quantity/price rules, validation and tests.
- `src/data/`: fixtures, repository interface, local adapter and tests.
- `src/components/`: order entry, review, and shared confirmation/driver preview.
- `src/App.tsx`: dashboard and workflow navigation.
- `src/styles.css`: responsive screen and print styles.
- `docs/`: discovery context, scope, decisions, walkthrough and verification record.

Order processing requires no remote services. Feedback is explicitly submitted to Natusoy's Supabase project through a server-only Vercel Function. See [feedback setup](docs/feedback.md).
