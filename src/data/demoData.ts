import type { Order, OrderLine } from "../domain/order";
import { discountedPrice } from "../domain/order";
export const customers = [
  "Healthy Planet <HO>",
  "H-Mart / Cummer",
  "Bestco Fresh Mart",
];
export const products = [
  {
    sku: "STN2001",
    description: "Sea Tangle - Kelp Noodles 340g x12",
    listPrice: 66,
    priceKnown: true,
  },
  {
    sku: "PP40786",
    description: "Fettuccine Style Noodle 100g x 12",
    listPrice: 54.6,
    priceKnown: true,
  },
  {
    sku: "PP40787",
    description: "Spaghetti Style Noodle 100g x 12",
    listPrice: 54.6,
    priceKnown: true,
  },
  {
    sku: "PP41304",
    description: "Cooked Soybean Sprout 300g x 20",
    listPrice: 69.85,
    priceKnown: true,
  },
  {
    sku: "PN100095",
    description: "San Sui Tofu-Soft - 425g x12",
    listPrice: 0,
    priceKnown: false,
  },
  {
    sku: "PN100096",
    description: "San Sui Tofu-Firm - 425g x12",
    listPrice: 0,
    priceKnown: false,
  },
];
export function makeLine(
  sku: string,
  requestedQty = 1,
  discountPercent = 0,
): OrderLine {
  const product = products.find((p) => p.sku === sku);
  if (!product) throw new Error("Unknown demo product");
  return {
    ...product,
    requestedQty,
    confirmedQty: product.priceKnown ? requestedQty : 0,
    discountPercent,
    finalUnitPrice: discountedPrice(product.listPrice, discountPercent),
    availabilityStatus: product.priceKnown ? "available" : "out_of_stock",
    lineNote: product.priceKnown
      ? ""
      : "O/S • normal selling price not provided",
    source: "demo",
    historicalRequestedQtyKnown: false,
  };
}
export function seedOrders(): Order[] {
  const known = (sku: string, qty: number, discount = 0): OrderLine => ({
    ...makeLine(sku, qty, discount),
    source: "discovery",
    historicalRequestedQtyKnown: true,
  });
  return [
    {
      id: "SL-DEMO-001",
      customer: customers[0],
      customerPO: "",
      status: "new",
      notes: "",
      createdAt: "2026-09-18T08:00:00-04:00",
      terms: "Net 30",
      historicalReference: "120726",
      lines: [known("STN2001", 5)],
    },
    {
      id: "SL-DEMO-002",
      customer: customers[1],
      customerPO: "",
      status: "needs_review",
      notes: "",
      createdAt: "2026-09-18T08:10:00-04:00",
      historicalReference: "120711",
      lines: [
        known("PP40786", 1, 10),
        known("PP40787", 1, 10),
        known("PP41304", 1, 10),
      ],
    },
    {
      id: "SL-DEMO-003",
      customer: customers[2],
      customerPO: "",
      status: "needs_review",
      notes:
        "Requested quantities of 5 are demo-only; original requested quantities are unknown.",
      createdAt: "2026-09-18T08:20:00-04:00",
      historicalReference: "120733",
      lines: [makeLine("PN100095", 5), makeLine("PN100096", 5)],
    },
  ];
}
