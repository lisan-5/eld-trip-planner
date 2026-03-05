import { API_BASE } from "./client";

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  // RFC 5987 (filename*=UTF-8''...) or plain filename="..."
  const rfc5987 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (rfc5987?.[1]) {
    try {
      return decodeURIComponent(rfc5987[1]);
    } catch {
      return rfc5987[1];
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return plain?.[1] ?? null;
}

export async function downloadLogsPdf(payload: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}/api/logs-pdf/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed: ${res.status}`);
  }

  const blob = await res.blob();
  const filename =
    parseFilename(res.headers.get("content-disposition")) ?? "eld-logs.pdf";

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Let the browser start the download before revoking.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
