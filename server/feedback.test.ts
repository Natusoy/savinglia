import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleFeedback, MAX_SCREENSHOT } from "./feedback";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), insert: vi.fn(), remove: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({
  storage: { from: () => ({ upload: mocks.upload, remove: mocks.remove }) },
  from: () => ({ insert: mocks.insert }),
}) }));
function form() {
  const data = new FormData();
  Object.entries({ author: "Lia", note: "The quantities are clear.", view_name: "review", order_id: "SL-DEMO-001",
    screen_title: "Order review", captured_at: "2026-09-18T13:00:00.000Z", viewport_width: "390", viewport_height: "844",
    session_id: "2d159445-ad28-46ac-9f62-9edc1175cd00", request_id: "18799f25-4e78-4658-ab59-4765c11ad625", app_version: "0.1.0", git_commit: "test",
  }).forEach(([key,value]) => data.set(key,value));
  data.set("screenshot", new Blob([new Uint8Array([137,80,78,71,13,10,26,10])], { type: "image/png" }), "viewport.png");
  return data;
}
const request = (data: FormData) => new Request("https://savinglia.example/api/feedback", { method: "POST", body: data });
beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co"); vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test-only");
  mocks.upload.mockReset().mockResolvedValue({ error: null }); mocks.insert.mockReset().mockResolvedValue({ error: null }); mocks.remove.mockReset().mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());
describe("feedback endpoint", () => {
  it.each(["Lia", "Aram", "Glen", "Justin"])("accepts %s as a feedback author", async (author) => {
    const data = form(); data.set("author", author);
    expect((await handleFeedback(request(data))).status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ author }));
  });
  it("rejects an invalid author before any remote writes", async () => {
    const data = form(); data.set("author", "Someone else");
    expect((await handleFeedback(request(data))).status).toBe(400); expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("rejects blank feedback", async () => {
    const data = form(); data.set("note", "   ");
    expect((await handleFeedback(request(data))).status).toBe(400); expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("rejects oversized or disguised screenshots", async () => {
    for (const bytes of [new Uint8Array(MAX_SCREENSHOT + 1), new TextEncoder().encode("not an image")]) {
      const data = form(); data.set("screenshot", new Blob([bytes], { type: "image/png" }), "fake.png");
      expect((await handleFeedback(request(data))).status).toBe(400);
    }
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("uploads binary and inserts context without requiring SELECT", async () => {
    const response = await handleFeedback(request(form()));
    expect(response.status).toBe(201);
    expect(mocks.upload.mock.calls[0][1]).toBeInstanceOf(Uint8Array);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ author: "Lia", view_name: "review", order_id: "SL-DEMO-001", viewport_width: 390, git_commit: "test" }));
  });
  it("uses the same generated ID for retries, accepting an already-saved submission", async () => {
    const first = await (await handleFeedback(request(form()))).json();
    mocks.upload.mockResolvedValue({ error: { statusCode: "409" } }); mocks.insert.mockResolvedValue({ error: { code: "23505" } });
    const retry = await (await handleFeedback(request(form()))).json();
    expect(retry).toEqual(first); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("cleans up its upload after a definite insert rejection", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23514" } });
    expect((await handleFeedback(request(form()))).status).toBe(502); expect(mocks.remove).toHaveBeenCalledOnce();
  });
  it("does not remove a screenshot when an insert result is uncertain", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "" } });
    expect((await handleFeedback(request(form()))).status).toBe(502); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("refuses an elevated key unless it is a current server secret", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_publishable_not-allowed");
    expect((await handleFeedback(request(form()))).status).toBe(503); expect(mocks.upload).not.toHaveBeenCalled();
  });
});
