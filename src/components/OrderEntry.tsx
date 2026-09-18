import { useLayoutEffect, useRef, useState } from "react";
import type { Order, OrderLine } from "../domain/order";
import { money } from "../domain/order";
import { customers, products, makeLine } from "../data/demoData";
export function OrderEntry({
  onSubmit,
  onCancel,
  onDirty,
  busy,
}: {
  onSubmit: (o: Order) => void;
  onCancel: () => void;
  onDirty: () => void;
  busy: boolean;
}) {
  const [customer, setCustomer] = useState(customers[0]);
  const [po, setPO] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([makeLine("STN2001")]);
  const [sku, setSku] = useState("PP40786");
  const [error, setError] = useState("");
  const [productNotice, setProductNotice] = useState<{ sku: string; text: string }>();
  const pendingProductFocus = useRef<string | null>(null);
  const lineCards = useRef(new Map<string, HTMLDivElement>());
  useLayoutEffect(() => {
    if (!pendingProductFocus.current) return;
    const card = lineCards.current.get(pendingProductFocus.current);
    card?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: "center", behavior: "instant" });
    pendingProductFocus.current = null;
  }, [lines, productNotice]);
  function add() {
    if (!sku) return;
    pendingProductFocus.current = sku;
    if (lines.some((l) => l.sku === sku)) {
      setProductNotice({ sku, text: "Already in this order. Update Requested Qty here, or select a different product above." });
      return;
    }
    setLines([...lines, makeLine(sku)]);
    setProductNotice({ sku, text: "Product added. Set Requested Qty here. To add another product, use Select product above." });
    setSku("");
    setError("");
    onDirty();
  }
  return (
    <form
      onChange={onDirty}
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !lines.length ||
          lines.some(
            (l) => !Number.isSafeInteger(l.requestedQty) || l.requestedQty < 1,
          )
        ) {
          setError(
            "Add at least one product with a positive whole requested quantity.",
          );
          return;
        }
        onSubmit({
          id: `SL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          customer,
          customerPO: po.trim(),
          notes: notes.trim(),
          status: "new",
          createdAt: new Date().toISOString(),
          lines,
        });
      }}
    >
      <button type="button" className="back" onClick={onCancel}>
        ← Order dashboard
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CUSTOMER / PROXY ENTRY</div>
          <h1>New order</h1>
          <p>
            Capture the request. Lia can review quantities before confirming.
          </p>
        </div>
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      <section className="panel form-panel">
        <div className="section-title">
          <span>01</span>
          <h2>Customer details</h2>
        </div>
        <div className="form-grid">
          <label>
            Customer
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Customer PO <small>Optional</small>
            <input
              value={po}
              maxLength={100}
              onChange={(e) => setPO(e.target.value)}
              placeholder="Customer’s purchase order reference"
            />
          </label>
        </div>
      </section>
      <section className="panel form-panel">
        <div className="section-title">
          <span>02</span>
          <h2>Requested products</h2>
        </div>
        <div className="add-product">
          <label>
            Select product
            <span className="product-picker-help" id="product-picker-help">
              Choose from {products.length} demo products, then add your selection to this order.
            </span>
            <select aria-describedby="product-picker-help" value={sku} onChange={(e) => setSku(e.target.value)}>
              <option value="" disabled>Choose a product…</option>
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} · {p.description}{lines.some((line) => line.sku === p.sku) ? " · Already in order" : ""}
                </option>
              ))}
            </select>
          </label>
          <p className="mobile-product-selection">
            {products.find((p) => p.sku === sku)?.description}
          </p>
          <button type="button" onClick={add} disabled={!sku}>
            ＋ Add selected product
          </button>
        </div>
        {lines.map((line) => (
          <div className="entry-line" key={line.sku} tabIndex={-1}
            aria-label={`Order product ${line.sku}`}
            ref={(card) => { if (card) lineCards.current.set(line.sku, card); else lineCards.current.delete(line.sku); }}>
            {productNotice?.sku === line.sku && <p className="entry-product-notice" role="status">{productNotice.text}</p>}
            <div>
              <span className="sku">{line.sku}</span>
              <strong>{line.description}</strong>
              <div className="mobile-entry-price">
                List price:{" "}
                {line.priceKnown ? money(line.listPrice) : "Not provided"}
              </div>
              {!line.priceKnown && (
                <small className="attention">
                  O/S-only example · normal price unavailable
                </small>
              )}
            </div>
            <label>
              Requested Qty
              <input
                aria-label={`Requested Qty ${line.sku}`}
                inputMode="numeric"
                type="number"
                min="1"
                step="1"
                required
                value={line.requestedQty || ""}
                onChange={(e) =>
                  setLines(
                    lines.map((l) =>
                      l.sku === line.sku
                        ? {
                            ...l,
                            requestedQty: Number(e.target.value),
                            confirmedQty: l.priceKnown
                              ? Number(e.target.value)
                              : 0,
                          }
                        : l,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="text-button"
              aria-label={`Remove ${line.sku}`}
              onClick={() => {
                setLines(lines.filter((l) => l.sku !== line.sku));
                onDirty();
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <p className="hint">
          Quantities use each product’s fixed selling unit. Product pack
          descriptions are shown as supplied.
        </p>
      </section>
      <section className="panel form-panel">
        <div className="section-title">
          <span>03</span>
          <h2>Order notes</h2>
        </div>
        <label>
          Notes / delivery instructions <small>Optional</small>
          <textarea
            value={notes}
            maxLength={2000}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add anything Lia or the driver needs to know…"
          />
        </label>
      </section>
      <div className="action-bar">
        <span>Saved only in this browser. No notification is sent.</span>
        <div className="actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            Submit order →
          </button>
        </div>
      </div>
    </form>
  );
}
