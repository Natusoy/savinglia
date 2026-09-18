import type { Order } from "../domain/order";
import {
  money,
  subtotal,
  availabilityLabels,
  statusLabels,
} from "../domain/order";
export function OrderPreview({
  order,
  driver,
  busy,
  onBack,
  onSwitch,
  onReady,
}: {
  order: Order;
  driver: boolean;
  busy: boolean;
  onBack: () => void;
  onSwitch: () => void;
  onReady: () => void;
}) {
  return (
    <>
      <div className="no-print">
        <button className="back" onClick={onBack}>
          ← Order review
        </button>
        <div className="page-heading">
          <div>
            <div className="eyebrow">CONFIRMED ORDER · {order.id}</div>
            <h1>
              {driver
                ? "Fulfillment / Driver Preview"
                : "Order Confirmation Preview"}
            </h1>
            <p>One confirmed order. Clear information for the next step.</p>
          </div>
          <div className="actions">
            <button onClick={onSwitch}>
              {driver ? "Confirmation preview" : "Driver preview"}
            </button>
            <button className="primary" onClick={() => window.print()}>
              Print {driver ? "driver summary" : "confirmation"}
            </button>
          </div>
        </div>
      </div>
      <section className={`paper ${driver ? "driver-paper" : ""}`}>
        <div className="paper-heading">
          <div>
            <div className="paper-brand">NATUSOY</div>
            <p>Saving Lia · Demo document</p>
          </div>
          <div>
            <h2>{driver ? "Fulfillment summary" : "Order confirmation"}</h2>
            <p>{order.id}</p>
          </div>
        </div>
        <div className="document-meta">
          <div>
            <span>CUSTOMER</span>
            <h3>{order.customer}</h3>
            <p>Customer PO: {order.customerPO || "Not provided"}</p>
          </div>
          <div>
            <span>ORDER STATUS</span>
            <p>{statusLabels[order.status]}</p>
            {order.terms && <p>Terms: {order.terms}</p>}
          </div>
        </div>
        <div className="table-scroll">
          <table className="document-table">
            <thead>
              <tr>
                <th>Product</th>
                {!driver && <th>Requested</th>}
                <th>Confirmed</th>
                {!driver && (
                  <>
                    <th>List price</th>
                    <th>Discount</th>
                    <th>Final unit</th>
                    <th>Line total</th>
                  </>
                )}
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l) => (
                <tr key={l.sku}>
                  <td>
                    <span className="sku">{l.sku}</span>
                    <strong>{l.description}</strong>
                    {l.lineNote && <small>{l.lineNote}</small>}
                    {l.availabilityStatus === "partial" && (
                      <small>
                        {l.requestedQty - l.confirmedQty} requested units
                        unconfirmed
                      </small>
                    )}
                    {!l.historicalRequestedQtyKnown &&
                      order.historicalReference && (
                        <small>
                          Requested quantity is demo-only; historical request
                          unknown.
                        </small>
                      )}
                  </td>
                  {!driver && <td data-label="Requested">{l.requestedQty}</td>}
                  <td className="confirmed-number" data-label="Confirmed">
                    {l.confirmedQty}
                  </td>
                  {!driver && (
                    <>
                      <td data-label="List Price">
                        {l.priceKnown ? money(l.listPrice) : "Unknown"}
                      </td>
                      <td data-label="Discount">{l.discountPercent}%</td>
                      <td data-label="Final Unit Price">
                        {money(l.finalUnitPrice)}
                      </td>
                      <td data-label="Line Total">
                        {money(l.finalUnitPrice * l.confirmedQty)}
                      </td>
                    </>
                  )}
                  <td
                    data-label="Availability"
                    className={`document-availability ${l.availabilityStatus}`}
                  >
                    {availabilityLabels[l.availabilityStatus]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!driver && (
          <div className="document-total">
            <span>Confirmed merchandise subtotal</span>
            <strong>{money(subtotal(order))}</strong>
            <small>
              CAD · Tax not calculated. This is not an invoice total.
            </small>
          </div>
        )}
        <div className="document-notes">
          <h3>Order / delivery notes</h3>
          <p>{order.notes || "No additional notes."}</p>
        </div>
        <div className="document-disclaimer">
          {driver
            ? "Fulfillment information only."
            : "Customer-facing order confirmation only."}{" "}
          Not a QuickBooks invoice. QuickBooks Bridge not connected in demo.
        </div>
      </section>
      <section className="handoff no-print">
        <div>
          <div className="eyebrow">NEXT STEP</div>
          <h2>Ready for QuickBooks</h2>
          <p>
            QuickBooks Bridge not connected in demo. Marking readiness sends
            nothing and creates no invoice.
          </p>
        </div>
        <button
          className={order.status === "ready_for_quickbooks" ? "" : "primary"}
          disabled={busy || order.status === "ready_for_quickbooks"}
          onClick={onReady}
        >
          {order.status === "ready_for_quickbooks"
            ? "✓ Ready for QuickBooks"
            : "Mark Ready for QuickBooks"}
        </button>
      </section>
    </>
  );
}
