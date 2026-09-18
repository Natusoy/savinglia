import type { Order } from "../domain/order";
import type { OrderRepository } from "./orderRepository";
import { seedOrders } from "./demoData";
const key = "saving-lia.orders.v1";
export function createLocalOrderRepository(
  storage: Pick<Storage, "getItem" | "setItem">,
): OrderRepository {
  function read(): Order[] {
    const raw = storage.getItem(key);
    if (!raw) {
      const seeds = seedOrders();
      storage.setItem(key, JSON.stringify(seeds));
      return seeds;
    }
    const data: unknown = JSON.parse(raw);
    if (
      !Array.isArray(data) ||
      !data.every(
        (o) =>
          o &&
          typeof o.id === "string" &&
          typeof o.customer === "string" &&
          Array.isArray(o.lines) &&
          o.lines.every(
            (l: Record<string, unknown>) =>
              typeof l.sku === "string" && typeof l.requestedQty === "number",
          ),
      )
    )
      throw new Error(
        "Saved demo data could not be read. Reset demo data to restore the examples.",
      );
    return data as Order[];
  }
  return {
    async list() {
      return read();
    },
    async save(order) {
      const orders = read();
      const index = orders.findIndex((o) => o.id === order.id);
      if (index < 0) orders.unshift(order);
      else orders[index] = order;
      storage.setItem(key, JSON.stringify(orders));
    },
    async reset() {
      const seeds = seedOrders();
      storage.setItem(key, JSON.stringify(seeds));
      return seeds;
    },
  };
}
// Lazy access: even a blocked browser storage getter becomes a handled repository error.
export const orderRepository: OrderRepository = {
  list: () =>
    Promise.resolve().then(() =>
      createLocalOrderRepository(window.localStorage).list(),
    ),
  save: (order) =>
    Promise.resolve().then(() =>
      createLocalOrderRepository(window.localStorage).save(order),
    ),
  reset: () =>
    Promise.resolve().then(() =>
      createLocalOrderRepository(window.localStorage).reset(),
    ),
};
