# Mobile UX hardening — 2026-09-18

Presentation-only pass. Domain types, pricing/quantity rules, repository behavior and fixtures were not changed. No remote services, deployments, pushes or commits were performed.

## Layout

- At screen widths up to 760px, the desktop sidebar/breadcrumb is replaced by a 64px compact sticky branded header with a menu for Dashboard, New Order and Reset Demo Data.
- Status cards remain a compact 2 × 2 grid; dashboard search is full width.
- Queue table rows become bordered cards using CSS grid and the same cells/actions. Every customer, ID, status, count, subtotal and review focus remains present. No duplicated order data or parallel mobile business logic.
- New-order lines stack into cards with full-width quantity and remove controls. Known list prices are shown; unknown prices remain explicitly unknown. Full selected-product description supplements the native select's single-line display.
- Review cards compare requested and confirmed quantities side by side, emphasize Partial/O/S, and stack pricing, availability and notes. Save Changes / Confirm Order remain in a sticky bottom bar with safe-area padding. Scroll padding/margins allow controls to scroll above the bar; validation errors scroll into view.
- Confirmation and driver table cells become labeled blocks. Driver confirmed quantities are 36px. Mobile data tables have no horizontal scrolling.
- Screen-only media queries isolate mobile layouts from print; print still uses tables. Existing intermediate 1100px and large-desktop 1500px styles remain.

## Browser verification

Chromium viewport simulation, not physical-device Safari/Android testing:

| View | 360px | 390px | 430px |
| --- | --- | --- | --- |
| Dashboard | No horizontal overflow | No horizontal overflow | No horizontal overflow |
| Review | No horizontal overflow | No horizontal overflow | No horizontal overflow |
| New order | No horizontal overflow | No horizontal overflow | No horizontal overflow |
| Confirmation | No horizontal overflow | No horizontal overflow | No horizontal overflow |
| Driver | No horizontal overflow | No horizontal overflow | No horizontal overflow |

Exact device-like viewports 360 × 800, 390 × 844 and 430 × 932 were inspected. Dashboard document scroll widths were respectively 360, 390 and 430. Review controls measured at least 44px high. At 390 × 844 the sticky action bar ended exactly at viewport bottom (top 745, bottom 844). Header measured 64px.

Completed 390px walkthrough:
1. Opened Healthy Planet and returned to Dashboard.
2. Opened H-Mart, changed PP40786 discount to 15%, saved, returned; subtotal became $158.42.
3. Opened Bestco: both requested quantities remained 5 with synthetic-source disclosure and zero confirmed quantity / O/S.
4. Used mobile menu to create a new H-Mart order with PO MOBILE-390, requested quantity 10 of STN2001, and an added PP40786 line.
5. Submitted and reopened the new queue card; changed confirmed quantity to 9, added a partial-fulfillment note and confirmed.
6. Confirmation preserved requested 10 / confirmed 9, Partial status, all prices and subtotal $648.60. Driver showed the same quantities and notes.
7. Returned through the mobile menu, refreshed and verified the confirmed order and earlier saved H-Mart discount remained.
8. Reset through the mobile menu and confirmation dialog; the original three orders and prices were restored.

Desktop regression at 1440 × 900: sidebar and desktop table retained; mobile header hidden; no page overflow; three seed orders; Healthy Planet review opens with editable controls. Browser reported no runtime errors.

Generated a driver PDF while the viewport was mobile and visually inspected its rendered page: paper table, quantities and notes retained; application controls absent.

## Validation and evidence

- 7 tests passed; TypeScript passed; production build passed; git diff --check passed.
- Artifacts (ignored): mobile-dashboard.png, mobile-order-review.png, mobile-review-viewport.png, mobile-new-order.png, mobile-confirmation-hardened.png, mobile-driver.png, desktop-mobile-regression.png, mobile-print-regression.pdf/png.
- Safe-area CSS is implemented; real-device software-keyboard and notch behavior still warrant physical-device testing.
- Implementation remains uncommitted on codex/mvp-demo-2026-09-18.

## Final overlap correction
The freeze pass adds a measured spacer before the sticky review bar. Border-box ResizeObserver tracks safe-area padding changes; clearance equals measured height plus 16px. All three viewports passed, including a simulated extra 32px inset. Desktop bottom padding remains zero. See MVP_V0_1_CHECKPOINT.md for final validation.
