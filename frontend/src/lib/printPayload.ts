/**
 * Renders API key/value payload in a zero-size iframe and triggers the browser print dialog.
 * Avoids opening a visible second window (same idea as re-fetching receipt data then printing).
 */
export function printKeyValuePayload(title: string, data: Record<string, unknown>): void {
  if (typeof document === "undefined") return;

  const esc = (v: unknown): string => {
    const s =
      v !== null && typeof v === "object"
        ? JSON.stringify(v)
        : v === undefined || v === null
          ? "—"
          : String(v);
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  };

  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;">${esc(k)}</th><td style="padding:8px;border:1px solid #ddd;">${esc(v)}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:1.15rem;margin:0 0 12px}
table{width:100%;border-collapse:collapse}</style></head><body>
<h1>${esc(title)}</h1><table>${rows}</table>
<p style="margin-top:16px;font-size:11px;color:#666">ParkSmart — ${esc(new Date().toLocaleString())}</p>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    document.body.removeChild(iframe);
    throw new Error("Print frame unavailable");
  }

  doc.open();
  doc.write(html);
  doc.close();
  win.focus();

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try {
      win.removeEventListener("afterprint", cleanup);
    } catch {
      /* ignore */
    }
    if (iframe.parentNode) document.body.removeChild(iframe);
  };

  win.addEventListener("afterprint", cleanup);
  setTimeout(() => {
    try {
      win.print();
    } catch {
      cleanup();
    }
  }, 100);
  setTimeout(cleanup, 120_000);
}
