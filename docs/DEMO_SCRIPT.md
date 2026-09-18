# Saving Lia — proposed in-person demo script

Status: walkthrough for the planned MVP, not a description of functionality already implemented. Resolve the open demo-data and status decisions in DECISIONS.md before implementation.

## Opening

Explain: “This demonstrates order preparation, review, confirmation, and fulfillment information. QuickBooks Bridge not connected in demo. No financial invoice, email, payment, or inventory update is generated.”

Use clearly labeled sample orders. Changes remain in this browser only. No private customer export is required.

## 1. Healthy Planet — normal order

Open the preloaded Healthy Planet <HO> order in Lia's queue. Review STN2001, Sea Tangle - Kelp Noodles: requested quantity 5, $66.00 per unit, $330.00 observed line total, Net 30, no discount.

Show requested versus confirmed quantities, confirm the order using the agreed demo status flow, then open customer confirmation and driver summary. Demonstrate browser print preview. Show Ready for QuickBooks without claiming an invoice was generated. Historical #120726 is discovery provenance only.

## 2. H-Mart / Cummer — discount transparency

Open the discount example. Show PP40786 and PP40787 at list $54.60, 10% discount, final $49.14; PP41304 at list $69.85, 10% discount, observed final $62.87.

Use SKU labels where descriptions are unknown. Quantities require an explicit demo-data decision; do not claim unprovided quantities as historical facts. Show how confirmation explains list price, discount, and final unit price. Historical #120711 is provenance only.

## 3. Bestco Fresh Mart — O/S and partial fulfillment

Open PN100095 and PN100096 as the observed O/S example. Demonstrate retained requested quantities, confirmed quantity zero, and visible O/S notes. Missing requested quantities/prices must be resolved or clearly marked before the walkthrough. Historical #120733 is provenance only.

If approved, use a separately labeled synthetic partial-fulfillment example showing 10 requested and 9 confirmed. This is an illustration of the discovery finding, not a claimed historical Bestco invoice line. Explain that the remaining quantity is visible; the demo does not automatically schedule another delivery.

## 4. New order end to end

Use customer/proxy Order Entry: choose a customer and known product, enter customer PO, requested quantity, and notes as appropriate. Submit, switch to Lia's queue, open the order, review and adjust confirmed quantities, then confirm and show both outputs and the QuickBooks readiness indicator.

Explain that view switching demonstrates the workflow in one browser; it does not simulate real email or multi-user synchronization.

## Closing checks

- Refresh to demonstrate local persistence.
- Show a narrow/mobile layout and a printable confirmation without app navigation.
- If implemented as proposed, reset demo data only after explicit confirmation and verify deterministic fixtures return.
- Collect feedback on Lia's review effort, quantity clarity, discount explanation, driver information, and document wording.
- Do not suggest production tax/pricing completeness or a working QuickBooks bridge.

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
