// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { Feedback } from "./Feedback";
import { captureViewport } from "./capture";
vi.mock("./capture", () => ({ captureViewport: vi.fn() }));
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  window.scrollTo = vi.fn();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  URL.createObjectURL = vi.fn(() => "blob:test"); URL.revokeObjectURL = vi.fn();
  vi.mocked(captureViewport).mockResolvedValue(new Blob(["image"], { type: "image/png" }));
  localStorage.clear(); sessionStorage.clear();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("captures before opening the composer and does not capture on render", async () => {
  vi.mocked(captureViewport).mockClear();
  let resolve!: (blob: Blob) => void;
  vi.mocked(captureViewport).mockReturnValue(new Promise(done => { resolve = done; }));
  render(<Feedback view="dashboard" />);
  expect(captureViewport).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Feedback" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  resolve(new Blob(["image"], { type: "image/png" }));
  await screen.findByRole("dialog");
  expect(screen.getAllByRole("radio").map(r => (r as HTMLInputElement).value)).toEqual(["Lia", "Aram", "Glen", "Justin"]);
});
it("leaves unsaved order quantity and persisted orders unchanged when cancelled", async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "Open Healthy Planet <HO>" }));
  const quantity = screen.getByRole("spinbutton", { name: "Confirmed Qty STN2001" });
  fireEvent.change(quantity, { target: { value: "3" } });
  const persisted = localStorage.getItem("saving-lia.orders.v1");
  fireEvent.click(screen.getByRole("button", { name: "Feedback" }));
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect((quantity as HTMLInputElement).value).toBe("3");
  expect(localStorage.getItem("saving-lia.orders.v1")).toBe(persisted);
  expect(screen.getByRole("button", { name: "Save Changes" })).toBeTruthy();
});
it("requires an author, retains a failed draft and retries multipart without recapturing", async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal("fetch", fetchMock); vi.mocked(captureViewport).mockClear();
  render(<Feedback view="entry" />);
  fireEvent.click(screen.getByRole("button", { name: "Feedback" })); await screen.findByRole("dialog");
  fireEvent.change(screen.getByRole("textbox", { name: "What are you thinking?" }), { target: { value: "Please clarify the product name." } });
  expect((screen.getByRole("button", { name: "Save Feedback" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: "Aram" }));
  fireEvent.click(screen.getByRole("button", { name: "Save Feedback" }));
  fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByRole("status").textContent).toBe("Feedback saved. Thank you.");
  expect(fetchMock.mock.calls[1][1].body).toBeInstanceOf(FormData);
  expect(fetchMock.mock.calls[1][1].body.get("note")).toBe("Please clarify the product name.");
  expect(captureViewport).toHaveBeenCalledTimes(1);
});
