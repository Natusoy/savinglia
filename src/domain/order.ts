export type Status =
  | "new"
  | "needs_review"
  | "confirmed"
  | "ready_for_quickbooks";
export type Availability = "available" | "partial" | "out_of_stock";
export interface OrderLine {
  sku: string;
  description: string;
  requestedQty: number;
  confirmedQty: number;
  listPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  availabilityStatus: Availability;
  lineNote: string;
  priceKnown: boolean;
  source: "discovery" | "demo";
  historicalRequestedQtyKnown: boolean;
}
export interface Order {
  id: string;
  customer: string;
  customerPO: string;
  status: Status;
  notes: string;
  createdAt: string;
  lines: OrderLine[];
  terms?: string;
  historicalReference?: string;
}
export const statusLabels: Record<Status, string> = {
  new: "New",
  needs_review: "Needs Review",
  confirmed: "Confirmed",
  ready_for_quickbooks: "Ready for QuickBooks",
};
export const availabilityLabels: Record<Availability, string> = {
  available: "Available",
  partial: "Partial",
  out_of_stock: "O/S",
};
export const money = (value: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    value,
  );
// Demo policy: cents × basis points, rounded half-up. Not a production tax/pricing engine.
export function discountedPrice(price: number, percent: number) {
  return (
    Math.round(
      (Math.round(price * 100) * (10000 - Math.round(percent * 100))) / 10000,
    ) / 100
  );
}
export function reviseLine(
  line: OrderLine,
  patch: Partial<OrderLine>,
): OrderLine {
  const next = { ...line, ...patch, requestedQty: line.requestedQty };
  if (patch.availabilityStatus === "out_of_stock") next.confirmedQty = 0;
  if (patch.availabilityStatus === "available")
    next.confirmedQty = next.requestedQty;
  if (
    patch.availabilityStatus === "partial" &&
    (next.confirmedQty <= 0 || next.confirmedQty >= next.requestedQty)
  )
    next.confirmedQty = Math.max(0, next.requestedQty - 1);
  if (patch.confirmedQty !== undefined)
    next.availabilityStatus =
      next.confirmedQty === 0
        ? "out_of_stock"
        : next.confirmedQty < next.requestedQty
          ? "partial"
          : "available";
  next.finalUnitPrice = discountedPrice(next.listPrice, next.discountPercent);
  return next;
}
export const subtotal = (order: Order) =>
  order.lines.reduce(
    (cents, line) =>
      cents + Math.round(line.finalUnitPrice * 100) * line.confirmedQty,
    0,
  ) / 100;
export function validateOrder(order: Order): string | null {
  if (!order.customer || !order.lines.length)
    return "Choose a customer and add at least one product.";
  for (const l of order.lines) {
    if (
      !Number.isSafeInteger(l.requestedQty) ||
      l.requestedQty < 1 ||
      !Number.isSafeInteger(l.confirmedQty) ||
      l.confirmedQty < 0 ||
      l.confirmedQty > l.requestedQty
    )
      return `${l.sku}: use whole quantities; confirmed quantity must be between zero and requested quantity.`;
    if (
      !Number.isFinite(l.discountPercent) ||
      l.discountPercent < 0 ||
      l.discountPercent > 100
    )
      return `${l.sku}: discount must be between 0 and 100%.`;
    if (!l.priceKnown && l.confirmedQty > 0)
      return `${l.sku}: normal selling price is unknown. Keep this O/S-only demo item at zero confirmed quantity.`;
    if (
      l.availabilityStatus === "partial" &&
      (l.confirmedQty <= 0 || l.confirmedQty >= l.requestedQty)
    )
      return `${l.sku}: partial quantity must be greater than zero and below requested quantity.`;
  }
  return null;
}
