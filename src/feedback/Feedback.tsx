import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { captureViewport } from "./capture";
import { authors, feedbackContext, feedbackSession, type Author, type FeedbackContext, type ViewName } from "./context";

export function Feedback({ view, orderId }: { view: ViewName; orderId?: string }) {
  const [shot, setShot] = useState<{ blob: Blob; url: string; context: FeedbackContext; requestId: string }>();
  const [author, setAuthor] = useState<Author>();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [barHeight, setBarHeight] = useState(0);
  const [viewport, setViewport] = useState({ height: window.visualViewport?.height ?? innerHeight, top: window.visualViewport?.offsetTop ?? 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);

  useLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>(".review-actions");
    const measure = () => setBarHeight(innerWidth <= 760 && bar ? Math.ceil(bar.getBoundingClientRect().height) : 0);
    measure();
    const observer = new ResizeObserver(measure);
    if (bar) observer.observe(bar);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [view, orderId]);
  useEffect(() => {
    const measure = () => setViewport({ height: window.visualViewport?.height ?? innerHeight, top: window.visualViewport?.offsetTop ?? 0 });
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => { window.visualViewport?.removeEventListener("resize", measure); window.visualViewport?.removeEventListener("scroll", measure); };
  }, []);
  useEffect(() => {
    if (!shot) return;
    dialog.current?.showModal();
    return () => URL.revokeObjectURL(shot.url);
  }, [shot]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function open() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(""); setNotice("");
    const context = feedbackContext(view, orderId, {
      width: window.visualViewport?.width ?? innerWidth,
      height: window.visualViewport?.height ?? innerHeight,
    }, feedbackSession());
    try {
      const blob = await captureViewport();
      setAuthor(undefined); setNote("");
      setShot({ blob, url: URL.createObjectURL(blob), context, requestId: crypto.randomUUID() });
    } catch { setError("Screenshot could not be captured. Tap Feedback to retry."); }
    finally { pending.current = false; setBusy(false); }
  }
  function close() {
    if (pending.current) return;
    dialog.current?.close(); setShot(undefined); setError(""); trigger.current?.focus();
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!shot || !author || !note.trim() || pending.current) return;
    pending.current = true; setBusy(true); setError("");
    const data = new FormData();
    data.set("screenshot", shot.blob, shot.blob.type === "image/webp" ? "viewport.webp" : "viewport.png");
    data.set("author", author); data.set("note", note.trim()); data.set("request_id", shot.requestId);
    Object.entries(shot.context).forEach(([key, value]) => data.set(key, String(value)));
    try {
      const response = await fetch("/api/feedback", { method: "POST", body: data, signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error("save failed");
      dialog.current?.close(); setShot(undefined); setNotice("Feedback saved. Thank you."); trigger.current?.focus();
    } catch { setError("Feedback could not be saved. Your note and screenshot are still here. Please retry."); }
    finally { pending.current = false; setBusy(false); }
  }
  return createPortal(<div className="feedback-layer no-print" data-feedback-ui>
    <button ref={trigger} className="feedback-trigger" style={{ bottom: barHeight ? `${barHeight + 12}px` : undefined }} onClick={open} disabled={busy || !!shot}>
      {busy && !shot ? "Capturing…" : "Feedback"}
    </button>
    {!shot && (notice || error) && <div className="feedback-toast" role={error ? "alert" : "status"}>{error || notice}</div>}
    {shot && <dialog ref={dialog} className="feedback-dialog" aria-labelledby="feedback-title" style={{ maxHeight: `${viewport.height - 24}px`, top: `${viewport.top + 12}px` }} onCancel={event => { event.preventDefault(); close(); }}>
      <form onSubmit={submit}>
        <div className="feedback-body">
          <h2 id="feedback-title">Feedback</h2>
          <p className="feedback-explanation">Save this screenshot and your note to Natusoy’s research feedback.</p>
          <img className="feedback-screenshot" src={shot.url} alt="Captured Saving Lia viewport" />
          <fieldset><legend>Who are you?</legend><div className="feedback-authors">
            {authors.map(name => <label key={name} className={author === name ? "selected" : ""}>
              <input type="radio" name="feedback-author" value={name} checked={author === name} onChange={() => setAuthor(name)} required disabled={busy} />{name}
            </label>)}
          </div></fieldset>
          <label className="feedback-note">What are you thinking?
            <textarea value={note} onChange={event => setNote(event.target.value)} required maxLength={5000} rows={4} disabled={busy} />
          </label>
          {error && <p role="alert" className="feedback-error">{error}</p>}
        </div>
        <div className="feedback-actions"><button type="button" onClick={close} disabled={busy}>Cancel</button><button className="primary" disabled={busy || !author || !note.trim()}>{busy ? "Saving…" : error ? "Retry" : "Save Feedback"}</button></div>
      </form>
    </dialog>}
  </div>, document.body);
}
