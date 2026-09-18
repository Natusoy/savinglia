import { useLayoutEffect, useRef, useState } from "react";
import type { Order, OrderLine, Availability } from "../domain/order";
import {
  reviseLine,
  validateOrder,
  money,
  subtotal,
  statusLabels,
} from "../domain/order";
export function OrderReview({
  order,
  busy,
  onDirty,
  onBack,
  onSave,
  onConfirm,
  onPreview,
}: {
  order: Order;
  busy: boolean;
  onDirty: () => void;
  onBack: () => void;
  onSave: (o: Order) => void;
  onConfirm: (o: Order) => void;
  onPreview: (v: "confirmation" | "driver") => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(order));
  const [error, setError] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const actions = actionsRef.current;
    if (!actions) return;
    // Includes wrapped text, buttons and safe-area padding; updates on resize.
    const measure = () =>
      pageRef.current?.style.setProperty(
        "--review-actions-height",
        `${Math.ceil(actions.getBoundingClientRect().height)}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(actions, { box: "border-box" });
    return () => observer.disconnect();
  }, []);
  const locked =
    order.status === "confirmed" || order.status === "ready_for_quickbooks";
  function update(sku: string, patch: Partial<OrderLine>) {
    setDraft({
      ...draft,
      lines: draft.lines.map((l) => (l.sku === sku ? reviseLine(l, patch) : l)),
    });
    onDirty();
  }
  function submit(confirm: boolean) {
    const invalid = validateOrder(draft);
    if (invalid) {
      setError(invalid);
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>("[role=alert]")
          ?.scrollIntoView({ block: "center" }),
      );
      return;
    }
    setError("");
    const next = {
      ...draft,
      status: confirm ? ("confirmed" as const) : ("needs_review" as const),
    };
    if (confirm) onConfirm(next);
    else onSave(next);
  }
  return (
    <div className="review-page" ref={pageRef}>
      <button className="back" onClick={onBack}>
        ← Order dashboard
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORDER REVIEW · {order.id}</div>
          <h1>{order.customer}</h1>
          <p>
            {order.customerPO
              ? `PO ${order.customerPO}`
              : "No customer PO provided"}{" "}
            {order.terms && `· ${order.terms}`}
          </p>
        </div>
        <span className={`badge ${order.status}`}>
          {statusLabels[order.status]}
        </span>
      </div>
      {error && (
        <div role="alert" className="alert error">
          {error}
        </div>
      )}
      {order.historicalReference && (
        <div className="source-note">
          Discovery example · historical invoice reference #
          {order.historicalReference}. This is a demo order, not that financial
          invoice.
        </div>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Check the request. Confirm the delivery.</h2>
            <p>
              Requested quantities stay intact, even when availability changes.
            </p>
          </div>
          <span className="count">{draft.lines.length} products</span>
        </div>
        <div className="review-lines">
          {draft.lines.map((line) => (
            <article
              className={`review-line review-${line.availabilityStatus}`}
              key={line.sku}
            >
              <div className="product-heading">
                <div>
                  <span className="sku">{line.sku}</span>
                  <h3>{line.description}</h3>
                  {!line.historicalRequestedQtyKnown &&
                    order.historicalReference && (
                      <p className="synthetic">
                        Demo-only requested quantity · historical request
                        unknown
                      </p>
                    )}
                </div>
                <span className={`badge ${line.availabilityStatus}`}>
                  {line.availabilityStatus === "out_of_stock"
                    ? "O/S"
                    : line.availabilityStatus === "partial"
                      ? "Partial"
                      : "Available"}
                </span>
              </div>
              <div className="line-grid">
                <label>
                  Requested Qty
                  <div className="readonly-value">{line.requestedQty}</div>
                </label>
                <label>
                  Confirmed Qty
                  <input
                    aria-label={`Confirmed Qty ${line.sku}`}
                    disabled={locked}
                    inputMode="decimal"
                    type="number"
                    min="0"
                    max={line.requestedQty}
                    step="1"
                    value={
                      Number.isNaN(line.confirmedQty) ? "" : line.confirmedQty
                    }
                    onChange={(e) =>
                      update(line.sku, {
                        confirmedQty:
                          e.target.value === "" ? NaN : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  List Price
                  <div className="readonly-value">
                    {line.priceKnown ? money(line.listPrice) : "Not provided"}
                  </div>
                </label>
                <label>
                  Discount %
                  <input
                    aria-label={`Discount ${line.sku}`}
                    disabled={locked || !line.priceKnown}
                    inputMode="decimal"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                      Number.isNaN(line.discountPercent)
                        ? ""
                        : line.discountPercent
                    }
                    onChange={(e) =>
                      update(line.sku, {
                        discountPercent:
                          e.target.value === "" ? NaN : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Final Unit Price
                  <div className="readonly-value final-price">
                    {money(line.finalUnitPrice)}
                  </div>
                </label>
                <label>
                  Availability
                  <select
                    aria-label={`Availability ${line.sku}`}
                    disabled={locked}
                    value={line.availabilityStatus}
                    onChange={(e) =>
                      update(line.sku, {
                        availabilityStatus: e.target.value as Availability,
                      })
                    }
                  >
                    <option value="available">Available</option>
                    <option value="partial">Partial</option>
                    <option value="out_of_stock">Out of stock (O/S)</option>
                  </select>
                </label>
              </div>
              {!line.priceKnown && (
                <p className="hint">
                  $0.00 reflects the historical O/S line, not a normal selling
                  price. Keep confirmed quantity at zero in this demo.
                </p>
              )}
              {line.availabilityStatus === "partial" && (
                <p className="attention">
                  {line.requestedQty - line.confirmedQty} requested units remain
                  unconfirmed. No automatic backorder is created.
                </p>
              )}
              <label className="line-note">
                Line note
                <input
                  aria-label={`Line note ${line.sku}`}
                  disabled={locked}
                  value={line.lineNote}
                  maxLength={500}
                  placeholder="Availability or fulfillment note…"
                  onChange={(e) =>
                    update(line.sku, { lineNote: e.target.value })
                  }
                />
              </label>
            </article>
          ))}
        </div>
      </section>
      <div className="review-bottom">
        <section className="panel form-panel">
          <h2>Order / delivery notes</h2>
          <label>
            <span className="sr-only">Order note</span>
            <textarea
              disabled={locked}
              value={draft.notes}
              maxLength={2000}
              onChange={(e) => {
                setDraft({ ...draft, notes: e.target.value });
                onDirty();
              }}
              placeholder="Notes carried through to confirmation and driver summary…"
            />
          </label>
        </section>
        <section className="panel totals">
          <span>Confirmed merchandise subtotal</span>
          <strong>{money(subtotal(draft))}</strong>
          <p>
            CAD · Tax not calculated in demo.
            <br />
            Not a financial invoice.
          </p>
        </section>
      </div>
      <div className="action-bar review-actions no-print" ref={actionsRef}>
        <span>
          {locked
            ? "Confirmed order · quantities and pricing are locked in this demo."
            : "Review quantities and pricing before confirming."}
        </span>
        <div className="actions">
          {locked ? (
            <>
              <button onClick={() => onPreview("driver")}>
                Driver preview
              </button>
              <button
                className="primary"
                onClick={() => onPreview("confirmation")}
              >
                Order confirmation →
              </button>
            </>
          ) : (
            <>
              <button disabled={busy} onClick={() => submit(false)}>
                Save Changes
              </button>
              <button
                className="primary"
                disabled={busy}
                onClick={() => submit(true)}
              >
                Confirm Order →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
