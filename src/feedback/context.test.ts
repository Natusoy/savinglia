import { describe, expect, it } from "vitest";
import { feedbackContext, views, screenTitles } from "./context";
describe("feedback context", () => {
  it("records the logical view and only associates order screens with an order", () => {
    for (const view of views) {
      const result = feedbackContext(view, "SL-DEMO-001", { width: 390, height: 844 }, "session", new Date("2026-09-18T13:00:00Z"));
      expect(result.view_name).toBe(view); expect(result.screen_title).toBe(screenTitles[view]);
      expect(result.order_id).toBe(["dashboard", "entry"].includes(view) ? "" : "SL-DEMO-001");
      expect(result.viewport_width).toBe(390); expect(result.viewport_height).toBe(844);
      expect(result.captured_at).toBe("2026-09-18T13:00:00.000Z"); expect(result.session_id).toBe("session");
      expect(result).not.toHaveProperty("route");
    }
  });
});
