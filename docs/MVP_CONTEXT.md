# Saving Lia — discovery context

Source: user-provided discovery findings, 2026-09-18. The facts below are confirmed discovery observations, not a complete production specification. Approximate counts are not imported datasets. No underlying customer export or invoice files are present in this repository.

## Current workflow

- Natusoy uses QuickBooks Premier Edition 2024, Canadian edition.
- Lia or Aram receives customer orders and manually enters them into QuickBooks.
- QuickBooks generates the financial invoice, which is printed. A copy goes with the driver, a copy goes to the customer, and a signed physical copy returns to Lia/Aram.
- Order and Confirmation are effectively one current document/process. Confirmation can be represented as a PDF/customer-facing document; it is distinct from the QuickBooks financial invoice.
- Intended recipients of Customer Order Initiation are Lia, Aram, and Glen. This does not establish a notification implementation requirement for this demo.

## Roles

| Person | Confirmed responsibilities/authority |
| --- | --- |
| Lia | Receives orders, enters orders into QuickBooks, has discount authority |
| Aram | Receives orders, has discount authority |
| Glen | Owner; price management and discount authority; generally not involved in routine order entry |

These observations do not define a production authorization matrix. The demo has no authentication.

## Customers

- A QuickBooks Customer List export contains approximately 275 rows.
- Each store/location is generally its own QuickBooks customer.
- Customer data includes company/address information; email may be absent.
- Common payment terms include Due on Receipt and Net 30.
- Do not import private balances, phone numbers, or other customer information unless required.

## Products and pricing

- Discovery indicates approximately 546 QuickBooks items, each with a fixed selling unit. Actual unit labels have not been supplied for the examples.
- Observed pricing includes normal list prices, percentage discounts, customer-level discounts, customer × product special prices, manual rate overrides, Buy X/Get additional quantity free promotions, and occasional product-wide promotions.
- Some products have HST and some do not. Tax applicability/rates, stacking, precedence, and general rounding rules are not specified here.
- The MVP must not attempt a complete production pricing engine.

## Availability and partial fulfillment

- Out-of-stock requested products remain represented: retain requested quantity, allow confirmed/fulfilled quantity of zero, and show O/S or availability information.
- Partial fulfillment is possible: if 9 of 10 units are available, 9 may be delivered.
- Remaining product may generally be retried later unless urgent. This does not define an automatic backorder, retry schedule, or inventory synchronization rule.
- Confirmed quantity in the demo represents planned fulfillment, not evidence of actual delivery.

## Confirmed examples

### A — Normal pricing

Customer: Healthy Planet <HO>. Historical invoice reference: #120726.

| SKU | Provided description | Quantity | Unit price | Line total |
| --- | --- | --- | --- | --- |
| STN2001 | Sea Tangle - Kelp Noodles | 5 | $66.00 | $330.00 |

Terms: Net 30. No discount.

### B — Discount

Customer: H-Mart / Cummer. Historical invoice reference: #120711.

| SKU | List unit price | Discount | Observed final unit price |
| --- | --- | --- | --- |
| PP40786 | $54.60 | 10% | $49.14 |
| PP40787 | $54.60 | 10% | $49.14 |
| PP41304 | $69.85 | 10% | $62.87 |

Quantities and product descriptions were not supplied. Preserve the observed final prices; do not infer a universal rounding policy. Customer-facing output should explain original price, discount, and final price.

### C — Out of stock

Customer: Bestco Fresh Mart. Historical invoice reference: #120733.

Observed O/S SKUs: PN100095 and PN100096. These lines remained represented. Requested quantities must remain available in the application model; confirmed quantities can be zero with an O/S note.

Descriptions, requested quantities, unit labels, and prices were not supplied.

## Integration boundary

A future QuickBooks Bridge POC is planned. Real QuickBooks integration and financial invoice creation are excluded from this MVP. Use “Ready for QuickBooks” and “QuickBooks Bridge not connected in demo.” Historical invoice references are source references, never identifiers for newly generated invoices.

## Existing technical baseline

- GitHub: Natusoy/savinglia. Safe static connectivity page and ignore files checkpointed locally before UI work.
- Local Vercel link: existing Natusoy/savinglia project. Earlier inspection reported a Next.js preset; do not alter or deploy during planning.
- Local Supabase link: gnlmjxxyhxbdljummiey, Natusoy's Project. No application schema/migrations in the repository.
- Credential files and generated link metadata stay ignored. No remote services are modified during this planning step.

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
