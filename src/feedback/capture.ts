import html2canvas from "html2canvas";

export async function captureViewport(): Promise<Blob> {
  const viewport = window.visualViewport;
  const width = Math.round(viewport?.width ?? innerWidth);
  const height = Math.round(viewport?.height ?? innerHeight);
  const canvas = await html2canvas(document.body, {
    x: window.scrollX + (viewport?.offsetLeft ?? 0),
    y: window.scrollY + (viewport?.offsetTop ?? 0),
    width, height, windowWidth: innerWidth, windowHeight: innerHeight,
    scrollX: window.scrollX, scrollY: window.scrollY,
    scale: Math.min(1.5, devicePixelRatio || 1), logging: false,
    backgroundColor: "#f5f7f2", useCORS: false,
    ignoreElements: element => element.hasAttribute("data-feedback-ui") ||
      element.tagName.toLowerCase().startsWith("vercel-"),
  });
  const encode = (type: string, quality?: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));
  const blob = await encode("image/webp", 0.85) ?? await encode("image/png");
  if (!blob || blob.size > 2 * 1024 * 1024) throw new Error("Screenshot is too large. Try again with a smaller viewport.");
  return blob;
}
