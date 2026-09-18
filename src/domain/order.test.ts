import { describe, it, expect } from "vitest";
import { discountedPrice, reviseLine, subtotal, validateOrder } from "./order";
import { makeLine, seedOrders } from "../data/demoData";
describe("order review invariants", () => {
  it("reproduces both observed 10% prices and the H-Mart total", () => {
    expect(discountedPrice(54.6, 10)).toBe(49.14);
    expect(discountedPrice(69.85, 10)).toBe(62.87);
    expect(subtotal(seedOrders()[1])).toBe(161.15);
  });
  it("retains the request when marking O/S", () => {
    const l = reviseLine(makeLine("STN2001", 5), {
      availabilityStatus: "out_of_stock",
    });
    expect(l.requestedQty).toBe(5);
    expect(l.confirmedQty).toBe(0);
    expect(l.availabilityStatus).toBe("out_of_stock");
  });
  it("preserves both quantities for partial fulfillment", () => {
    const l = reviseLine(makeLine("STN2001", 10), { confirmedQty: 9 });
    expect(l.requestedQty).toBe(10);
    expect(l.confirmedQty).toBe(9);
    expect(l.availabilityStatus).toBe("partial");
  });
  it("does not confirm unknown normal prices or invalid quantities", () => {
    const order = seedOrders()[2];
    order.lines[0] = reviseLine(order.lines[0], { confirmedQty: 1 });
    expect(validateOrder(order)).toContain("normal selling price is unknown");
    const normal = seedOrders()[0];
    normal.lines[0].confirmedQty = 6;
    expect(validateOrder(normal)).toContain("between zero and requested");
  });
});
