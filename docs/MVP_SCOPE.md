# Saving Lia — demo MVP scope

Status: implementation approved on 2026-09-18. The implementation addendum below supersedes earlier unresolved demo details.

## Purpose and journey

Build a polished, deterministic in-person demonstration for a small food-distribution business:

Customer/proxy entry → Lia's queue → review requested quantities → adjust confirmed quantities → represent discount and O/S → confirm → customer confirmation and driver summary available → Ready for QuickBooks.

Optimize for Lia's morning order work: calm presentation, readable hierarchy, useful large controls, clear status indicators, and desktop/mobile usability.

## Required views

1. **Order Entry:** customer selection, customer PO number, products, requested quantities, notes, submit. Required/optional field rules need agreement; do not invent them.
2. **Lia Dashboard:** New, Needs Review, Confirmed, and Ready for QuickBooks represented clearly. Exact transition behavior is a demo design decision awaiting review.
3. **Lia Order Review:** requested and confirmed quantities, list price, applicable discount, final price, O/S status, and notes. Requested quantity must survive review adjustments.
4. **Confirmation Preview:** readable customer-facing confirmation; browser print CSS supports printing/save-as-PDF. Do not imply a QuickBooks invoice exists.
5. **Fulfillment/Driver Preview:** confirmed quantities and relevant delivery notes, clearly labeled as a fulfillment summary rather than a financial invoice.
6. **Demo scenarios:** preload Healthy Planet normal pricing, H-Mart discount pricing, and Bestco O/S; allow a new demo order.

## Data discipline

- Use only provided business names, SKUs, descriptions, and observed pricing as confirmed facts.
- Never invent descriptions for undescribed SKUs; display the SKU and an explicit missing-description treatment.
- H-Mart quantities and Bestco quantities/prices are missing. Any proposed fixture values must be explicitly approved/labeled synthetic, or kept visibly unknown. Unknown price is not zero/free.
- Preserve provided historical invoice references as discovery provenance only.
- Do not import the full customer/item exports or private balances, phone numbers, or unnecessary personal data.
- Do not calculate a tax-inclusive invoice total or invent HST mapping. Clearly label any demonstrated line subtotal and its limitations.
- Preserve O/S lines and original requests; partial quantities must be understandable. No automatic retry/backorder creation.

## Technical boundaries

Local browser persistence is acceptable. Isolate it behind a repository/data interface so Supabase can replace it later without changing the user workflow. Keep future integration separate from persistence and UI; no real bridge calls now.

No authentication, real email, payment processing, inventory synchronization, QuickBooks integration, Supabase tables/migrations, deployment, or push in this step. Do not modify remote services.

## Demo acceptance criteria

- Three scenario fixtures are recognizable, with confirmed facts preserved and missing/synthetic fields distinguished.
- A newly submitted order appears in Lia's queue in the same browser.
- Lia can review and adjust confirmed quantities without losing requested quantities.
- Normal pricing reproduces 5 × $66.00 = $330.00; discount examples reproduce the observed final unit prices and explain the discount.
- O/S lines remain visible with zero confirmed quantity and an O/S indication. A partial-fulfillment example preserves the unmet requested quantity.
- Confirmation exposes consistent customer and driver previews and a clearly labeled Ready for QuickBooks state; no actual invoice or external notification is claimed.
- Both outputs print legibly without navigation controls. Driver output clearly shows confirmed quantities and delivery notes.
- Browser refresh retains demo changes; a clearly confirmed demo reset restores deterministic fixtures (proposed demo utility).
- No cross-device synchronization is claimed. Local data is not production storage.
- Core entry/review/confirm flow works with keyboard, narrow mobile layout, and desktop layout.
- No remote writes or external integrations are required to demonstrate the flow.

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
