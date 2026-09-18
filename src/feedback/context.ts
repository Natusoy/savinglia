export const views = ["dashboard", "entry", "review", "confirmation", "driver"] as const;
export type ViewName = (typeof views)[number];
export const authors = ["Lia", "Aram", "Glen"] as const;
export type Author = (typeof authors)[number];
export const screenTitles: Record<ViewName, string> = {
  dashboard: "Order dashboard", entry: "New order", review: "Order review",
  confirmation: "Order Confirmation Preview", driver: "Fulfillment / Driver Preview",
};
export interface FeedbackContext {
  captured_at: string; view_name: ViewName; order_id: string; screen_title: string;
  viewport_width: number; viewport_height: number; session_id: string;
  app_version: string; git_commit: string;
}
export function feedbackContext(view: ViewName, orderId: string | undefined,
  viewport: { width: number; height: number }, session: string, now = new Date()): FeedbackContext {
  return {
    captured_at: now.toISOString(), view_name: view,
    order_id: ["review", "confirmation", "driver"].includes(view) ? orderId || "" : "",
    screen_title: screenTitles[view], viewport_width: Math.round(viewport.width),
    viewport_height: Math.round(viewport.height), session_id: session,
    app_version: __APP_VERSION__, git_commit: __GIT_COMMIT__,
  };
}
let fallbackSession: string | undefined;
export function feedbackSession() {
  fallbackSession ??= crypto.randomUUID();
  try {
    const existing = sessionStorage.getItem("saving-lia.feedback-session");
    if (existing) return existing;
    sessionStorage.setItem("saving-lia.feedback-session", fallbackSession);
  } catch { /* Feedback remains usable if browser storage is blocked. */ }
  return fallbackSession;
}
