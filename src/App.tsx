import { useEffect, useState } from "react";
import type { Order, Status } from "./domain/order";
import { statusLabels, subtotal, money } from "./domain/order";
import { orderRepository } from "./data/localOrderRepository";
import { OrderEntry } from "./components/OrderEntry";
import { OrderReview } from "./components/OrderReview";
import { OrderPreview } from "./components/OrderPreview";

type View = "dashboard" | "entry" | "review" | "confirmation" | "driver";
export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const order = orders.find((o) => o.id === selected);
  useEffect(() => {
    orderRepository
      .list()
      .then(setOrders)
      .catch(() =>
        setError(
          "Unable to read saved demo data. Storage may be blocked or damaged. Enable browser storage or reset the demo.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function navigate(next: View, id = "") {
    setMobileMenu(false);
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setDirty(false);
    setSelected(id);
    setView(next);
    setNotice("");
    window.scrollTo(0, 0);
  }
  async function save(next: Order, destination: View, message: string) {
    setBusy(true);
    setError("");
    try {
      await orderRepository.save(next);
      setOrders(await orderRepository.list());
      setSelected(next.id);
      setView(destination);
      setDirty(false);
      setNotice(message);
      window.scrollTo(0, 0);
    } catch {
      setError(
        "Your changes could not be saved. Browser storage may be unavailable or full. Your edits remain on screen; try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    setBusy(true);
    try {
      setOrders(await orderRepository.reset());
      setView("dashboard");
      setSelected("");
      setFilter("all");
      setSearch("");
      setDirty(false);
      setError("");
      setNotice("The three original demo orders have been restored.");
      setResetOpen(false);
    } catch {
      setError("Reset failed. Enable browser storage and try again.");
    } finally {
      setBusy(false);
    }
  }
  const shown = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      `${o.customer} ${o.id} ${o.customerPO}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="shell">
      <header className="mobile-header no-print">
        <div className="brand">
          <span className="brand-icon">sl</span>
          <div>
            Saving Lia<small>by Natusoy</small>
          </div>
        </div>
        <button
          aria-expanded={mobileMenu}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? "Close ✕" : "Menu ☰"}
        </button>
        {mobileMenu && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileMenu(false);
            }}
          >
            <button onClick={() => navigate("dashboard")}>Dashboard</button>
            <button onClick={() => navigate("entry")}>＋ New Order</button>
            <button
              onClick={() => {
                setMobileMenu(false);
                setResetOpen(true);
              }}
            >
              Reset Demo Data
            </button>
          </nav>
        )}
      </header>
      <aside className="sidebar no-print">
        <div className="brand">
          <span className="brand-icon">sl</span>
          <div>
            Saving Lia<small>BY NATUSOY</small>
          </div>
        </div>
        <div className="workspace-label">ORDER WORKSPACE</div>
        <button
          className={view !== "entry" ? "nav active" : "nav"}
          onClick={() => navigate("dashboard")}
        >
          <span>▦</span> Order dashboard{" "}
          <span className="nav-count">{orders.length}</span>
        </button>
        <button
          className={view === "entry" ? "nav active" : "nav"}
          onClick={() => navigate("entry")}
        >
          <span>＋</span> New order
        </button>
        <div className="sidebar-bottom">
          <div className="local-indicator">
            <i /> Local demo
          </div>
          <p>
            One browser. A clearer path
            <br />
            from order to fulfillment.
          </p>
          <button className="reset-button" onClick={() => setResetOpen(true)}>
            Reset Demo Data
          </button>
          <div className="profile">
            <span>L</span>
            <div>
              Lia’s workspace<small>Natusoy · Order operations</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar no-print">
          <span>
            Workspace <b>/</b>{" "}
            {view === "dashboard"
              ? "Orders"
              : view === "entry"
                ? "New order"
                : order?.id}
          </span>
          <span className="demo-tag">DEMO · LOCAL DATA</span>
          <button className="mobile-reset" onClick={() => setResetOpen(true)}>
            Reset demo
          </button>
        </header>
        <main>
          {error && (
            <div className="alert error no-print" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="alert success no-print" role="status">
              {notice}
            </div>
          )}
          {loading ? (
            <p role="status">Loading your workspace…</p>
          ) : view === "dashboard" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">NATUSOY OPERATIONS</div>
                  <h1>Orders, ready for a closer look.</h1>
                  <p>Review what’s requested. Confirm what’s going out.</p>
                </div>
                <button className="primary" onClick={() => navigate("entry")}>
                  ＋ New Order
                </button>
              </div>
              <div className="metrics">
                {(Object.keys(statusLabels) as Status[]).map((status, i) => (
                  <button
                    key={status}
                    className={`metric ${filter === status ? "selected" : ""}`}
                    onClick={() =>
                      setFilter(filter === status ? "all" : status)
                    }
                    aria-pressed={filter === status}
                  >
                    <span>
                      <i className={`dot dot-${i}`} />
                      {statusLabels[status]}
                    </span>
                    <strong>
                      {orders.filter((o) => o.status === status).length}
                    </strong>
                    <small>
                      {
                        [
                          "Awaiting a first look",
                          "Quantities & pricing to check",
                          "Ready for fulfillment",
                          "Prepared for manual entry",
                        ][i]
                      }
                    </small>
                  </button>
                ))}
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Order queue <span className="count">{shown.length}</span>
                    </h2>
                    <p>Your customer requests, in one place.</p>
                  </div>
                  <label className="search">
                    <span className="sr-only">Search orders</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search customer, PO or order…"
                    />
                  </label>
                </div>
                <div className="queue-toolbar">
                  <button
                    className={filter === "all" ? "tab selected" : "tab"}
                    onClick={() => setFilter("all")}
                  >
                    All orders
                  </button>
                  <span>
                    {filter !== "all"
                      ? statusLabels[filter]
                      : "Demo scenarios + your new orders"}
                  </span>
                </div>
                <div className="table-scroll">
                  <table className="queue">
                    <thead>
                      <tr>
                        <th>Customer / order</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th>Review focus</th>
                        <th className="numeric">Subtotal</th>
                        <th>
                          <span className="sr-only">Open order</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <strong>{o.customer}</strong>
                            <small>
                              {o.id} {o.customerPO && `· PO ${o.customerPO}`}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${o.status}`}>
                              {statusLabels[o.status]}
                            </span>
                          </td>
                          <td>
                            {o.lines.length}{" "}
                            {o.lines.length === 1 ? "product" : "products"}
                          </td>
                          <td>
                            {o.lines.some(
                              (l) => l.availabilityStatus === "out_of_stock",
                            ) ? (
                              <span className="attention">
                                O/S · retain requested items
                              </span>
                            ) : o.lines.some(
                                (l) => l.availabilityStatus === "partial",
                              ) ? (
                              <span className="attention">
                                Partial fulfillment
                              </span>
                            ) : o.lines.some((l) => l.discountPercent > 0) ? (
                              "Discount pricing"
                            ) : (
                              "Standard pricing"
                            )}
                          </td>
                          <td className="numeric amount" data-label="Subtotal">
                            {money(subtotal(o))}
                          </td>
                          <td>
                            <button
                              className="text-button"
                              aria-label={`Open ${o.customer}`}
                              onClick={() => navigate("review", o.id)}
                            >
                              <span className="desktop-open">Open →</span>
                              <span className="mobile-open">Open Order →</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!shown.length && (
                  <div className="empty">
                    No orders match this view. Clear your search or create a new
                    order.
                  </div>
                )}
              </section>
              <div className="boundary">
                <span className="boundary-icon">↗</span>
                <div>
                  <strong>A prepared order. A clear handoff.</strong>
                  <p>
                    QuickBooks Bridge not connected in demo. Confirmations are
                    not financial invoices.
                  </p>
                </div>
              </div>
            </>
          ) : view === "entry" ? (
            <OrderEntry
              busy={busy}
              onDirty={() => setDirty(true)}
              onCancel={() => navigate("dashboard")}
              onSubmit={(o) =>
                save(
                  o,
                  "dashboard",
                  "Order submitted and added to Lia’s queue.",
                )
              }
            />
          ) : order && view === "review" ? (
            <OrderReview
              key={`${order.id}-${order.status}`}
              order={order}
              busy={busy}
              onDirty={() => setDirty(true)}
              onBack={() => navigate("dashboard")}
              onSave={(o) => save(o, "review", "Review saved on this browser.")}
              onConfirm={(o) =>
                save(
                  o,
                  "confirmation",
                  "Order confirmed. Customer and driver previews are available.",
                )
              }
              onPreview={(destination) => navigate(destination, order.id)}
            />
          ) : (
            order && (
              <OrderPreview
                order={order}
                driver={view === "driver"}
                busy={busy}
                onBack={() => navigate("review", order.id)}
                onSwitch={() =>
                  navigate(
                    view === "driver" ? "confirmation" : "driver",
                    order.id,
                  )
                }
                onReady={() =>
                  save(
                    { ...order, status: "ready_for_quickbooks" },
                    view,
                    "Marked Ready for QuickBooks. Nothing was sent to QuickBooks.",
                  )
                }
              />
            )
          )}
        </main>
        <footer className="no-print">
          Saving Lia{" "}
          <span>
            Local demonstration · No live orders or external connections
          </span>
        </footer>
      </div>
      {resetOpen && (
        <div className="modal-backdrop no-print">
          <section
            className="modal"
            onKeyDown={(e) => {
              if (e.key === "Escape" && !busy) setResetOpen(false);
              if (e.key === "Tab") {
                const controls =
                  e.currentTarget.querySelectorAll<HTMLButtonElement>(
                    "button:not(:disabled)",
                  );
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <div className="eyebrow">DEMO WORKSPACE</div>
            <h2 id="reset-title">Restore the original three orders?</h2>
            <p>
              This removes orders and edits saved in this browser, including
              unsaved changes. It does not affect any remote system.
            </p>
            <div className="actions">
              <button
                autoFocus
                onClick={() => setResetOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button className="primary" disabled={busy} onClick={reset}>
                Reset Demo Data
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
