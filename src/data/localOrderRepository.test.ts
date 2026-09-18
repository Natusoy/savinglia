import { describe, it, expect } from "vitest";
import { createLocalOrderRepository } from "./localOrderRepository";
import { seedOrders } from "./demoData";
function memory() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}
describe("local order repository", () => {
  it("persists changes across repository instances without mutating loaded records", async () => {
    const storage = memory();
    const repo = createLocalOrderRepository(storage);
    const orders = await repo.list();
    orders[0].notes = "Dock 2";
    expect((await repo.list())[0].notes).toBe("");
    await repo.save(orders[0]);
    expect((await createLocalOrderRepository(storage).list())[0].notes).toBe(
      "Dock 2",
    );
  });
  it("reset removes new orders and restores all seed values", async () => {
    const repo = createLocalOrderRepository(memory());
    const order = seedOrders()[0];
    order.id = "NEW";
    await repo.save(order);
    const changed = seedOrders()[1];
    changed.status = "confirmed";
    await repo.save(changed);
    expect(await repo.list()).toHaveLength(4);
    expect(await repo.reset()).toEqual(seedOrders());
    expect(await repo.list()).toEqual(seedOrders());
  });
  it("surfaces storage failures rather than reporting a false save", async () => {
    const repo = createLocalOrderRepository({
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    });
    await expect(repo.save(seedOrders()[0])).rejects.toThrow("quota");
  });
});
