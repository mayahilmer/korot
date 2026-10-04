export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlText(value: string): string {
  return escapeHtml(value.trim()).replace(/\n+/g, "<br />");
}

export function displayUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function safeHref(
  kind: "web" | "mail" | "tel",
  value: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f]/.test(trimmed)) return undefined;

  if (kind === "mail") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return undefined;
    return `mailto:${trimmed}`;
  }

  if (kind === "tel") {
    const compact = trimmed.replace(/[^\d+]/g, "");
    if (compact.length < 7) return undefined;
    return `tel:${compact}`;
  }

  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed.replace(/^https?:\/\//i, "")}`;
  }
  return undefined;
}

export function emailLooksOff(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function contentDisposition(filename: string): string {
  const fallback = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "") || "cv";
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export function downloadName(name: string, extension: string, fallback: string): string {
  const base = name.trim() || fallback;
  const safe = base.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-").slice(0, 80);
  return `${safe || fallback}.${extension}`;
}
