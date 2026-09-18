// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { OrderEntry } from "./OrderEntry";
import { products } from "../data/demoData";

beforeEach(() => { HTMLElement.prototype.scrollIntoView = vi.fn(); });
afterEach(cleanup);
function setup() {
  const onSubmit = vi.fn(); const onDirty = vi.fn();
  render(<OrderEntry onSubmit={onSubmit} onDirty={onDirty} onCancel={vi.fn()} busy={false} />);
  return { onSubmit, onDirty };
}
it("adds the selected product, makes its card visible and prevents an accidental repeated add", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "＋ Add selected product" }));
  const card = screen.getByLabelText("Order product PP40786");
  expect(document.activeElement).toBe(card);
  expect(card.scrollIntoView).toHaveBeenCalledWith({ block: "center", behavior: "instant" });
  expect(screen.getByRole("status").textContent).toContain("Product added");
  expect((screen.getByRole("combobox", { name: /^Select product/ }) as HTMLSelectElement).value).toBe("");
  expect((screen.getByRole("button", { name: "＋ Add selected product" }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
});
it("directs duplicate selection to the existing card without adding a line or changing its quantity", () => {
  const { onDirty } = setup();
  const qty = screen.getByRole("spinbutton", { name: "Requested Qty STN2001" });
  fireEvent.change(qty, { target: { value: "7" } });
  fireEvent.change(screen.getByRole("combobox", { name: /^Select product/ }), { target: { value: "STN2001" } });
  onDirty.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "＋ Add selected product" }));
  expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
  expect((qty as HTMLInputElement).value).toBe("7");
  expect(document.activeElement).toBe(screen.getByLabelText("Order product STN2001"));
  expect(screen.getByRole("status").textContent).toContain("Already in this order");
  expect(onDirty).not.toHaveBeenCalled();
});
it("keeps the existing catalog and order submission semantics when choosing a different product", () => {
  const { onSubmit } = setup();
  const picker = screen.getByRole("combobox", { name: /^Select product/ }) as HTMLSelectElement;
  expect([...picker.options].filter(o => o.value).map(o => o.value)).toEqual(products.map(p => p.sku));
  fireEvent.click(screen.getByRole("button", { name: "＋ Add selected product" }));
  fireEvent.change(picker, { target: { value: "PP40787" } });
  fireEvent.click(screen.getByRole("button", { name: "＋ Add selected product" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit order →" }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "new", lines: expect.arrayContaining([
    expect.objectContaining({ sku: "STN2001", requestedQty: 1 }),
    expect.objectContaining({ sku: "PP40786", requestedQty: 1 }),
    expect.objectContaining({ sku: "PP40787", requestedQty: 1 }),
  ]) }));
  expect(onSubmit.mock.calls[0][0].lines).toHaveLength(3);
});
