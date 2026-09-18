import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const MAX_SCREENSHOT = 2097152;
const MAX_REQUEST = MAX_SCREENSHOT + 65536;
const VIEWS = ["dashboard", "entry", "review", "confirmation", "driver"];
class InvalidFeedback extends Error {}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function validateFeedback(data: FormData) {
  function field(name: string, max: number, required = false) {
    const raw = data.get(name);
    if (data.getAll(name).length > 1 || (raw !== null && typeof raw !== "string")) throw new InvalidFeedback("Invalid field.");
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value.length > max || (required && !value)) throw new InvalidFeedback("Invalid field.");
    return value;
  }
  const author = field("author", 10, true);
  if (!["Lia", "Aram", "Glen", "Justin"].includes(author)) throw new InvalidFeedback("Choose Lia, Aram, Glen, or Justin.");
  const note = field("note", 5000, true);
  const view_name = field("view_name", 20, true);
  if (!VIEWS.includes(view_name)) throw new InvalidFeedback("Invalid view.");
  const captured_at = field("captured_at", 40, true);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(captured_at) || !Number.isFinite(Date.parse(captured_at))) throw new InvalidFeedback("Invalid capture time.");
  const dimension = (name: string) => {
    const value = Number(field(name, 6, true));
    if (!Number.isInteger(value) || value < 1 || value > 20000) throw new InvalidFeedback("Invalid viewport.");
    return value;
  };
  const requestId = field("request_id", 36, true);
  const session_id = field("session_id", 36, true);
  if (!uuid.test(requestId) || !uuid.test(session_id)) throw new InvalidFeedback("Invalid session.");
  const screenshot = data.get("screenshot");
  if (!(screenshot instanceof File) || data.getAll("screenshot").length !== 1 || screenshot.size === 0 || screenshot.size > MAX_SCREENSHOT) throw new InvalidFeedback("Screenshot must be at most 2 MiB.");
  const bytes = new Uint8Array(await screenshot.arrayBuffer());
  const png = [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
  const webp = new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
  if (!((screenshot.type === "image/png" && png) || (screenshot.type === "image/webp" && webp))) throw new InvalidFeedback("Screenshot must be PNG or WebP.");
  return {
    screenshot, bytes, extension: png ? "png" : "webp", requestId,
    row: { author, note, captured_at: new Date(captured_at).toISOString(), view_name,
      order_id: ["review", "confirmation", "driver"].includes(view_name) ? field("order_id", 100) || null : null,
      screen_title: field("screen_title", 150, true), viewport_width: dimension("viewport_width"),
      viewport_height: dimension("viewport_height"), session_id,
      app_version: field("app_version", 80) || null, git_commit: field("git_commit", 80) || null,
    },
  };
}

async function boundedForm(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new InvalidFeedback("Use multipart/form-data.");
  if (Number(request.headers.get("content-length")) > MAX_REQUEST) throw new InvalidFeedback("Request too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new InvalidFeedback("Missing request body.");
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST) { await reader.cancel(); throw new InvalidFeedback("Request too large."); }
    chunks.push(value);
  }
  const body = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  try { return await new Response(body, { headers: { "Content-Type": request.headers.get("content-type")! } }).formData(); }
  catch { throw new InvalidFeedback("Invalid multipart body."); }
}
const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function handleFeedback(request: Request) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Cross-origin submissions are not allowed." }, 403);
  try {
    const input = await validateFeedback(await boundedForm(request));
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key?.startsWith("sb_secret_")) return json({ error: "Feedback is not configured yet. Please try later." }, 503);
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    // Server-generated stable ID makes retries safe without granting table SELECT.
    // Include the payload so changing a failed draft cannot overwrite earlier feedback.
    const digest = createHmac("sha256", key).update(input.requestId).update(JSON.stringify(input.row)).update(input.bytes).digest("hex");
    const id = `${digest.slice(0,8)}-${digest.slice(8,12)}-4${digest.slice(13,16)}-a${digest.slice(17,20)}-${digest.slice(20,32)}`;
    const path = `${input.row.captured_at.slice(0,10)}/${id}.${input.extension}`;
    const bucket = supabase.storage.from("mvp-feedback-screenshots");
    const { error: uploadError } = await bucket.upload(path, input.bytes, { contentType: input.screenshot.type, upsert: false });
    if (uploadError && !["409", "Duplicate"].includes(String(uploadError.statusCode ?? uploadError.name))) return json({ error: "Screenshot upload failed. Please retry." }, 502);
    const { error } = await supabase.from("mvp_feedback").insert({ id, screenshot_path: path, ...input.row });
    if (error && error.code !== "23505") {
      // Do not delete on an ambiguous network failure: the insert may have committed.
      if (!uploadError && ["23502", "23514", "42501", "42P01", "PGRST204", "PGRST205"].includes(error.code)) await bucket.remove([path]);
      return json({ error: "Feedback could not be saved. Please retry." }, 502);
    }
    return json({ ok: true, id }, 201);
  } catch (error) {
    return error instanceof InvalidFeedback ? json({ error: error.message }, 400) : json({ error: "Feedback could not be saved. Please retry." }, 502);
  }
}
