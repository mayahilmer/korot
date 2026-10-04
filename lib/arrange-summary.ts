const BULLET = /^[-–—•*·▪►]+\s*/;

function clean(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function stripEnding(value: string): string {
  return value.replace(/[.;!?׃…\s]+$/g, "").trim();
}

function finishSentence(value: string): string {
  const text = clean(value);
  if (!text) return "";
  if (/[.!?׃…]$/.test(text)) return text;
  return `${text}.`;
}

function splitSentences(value: string): string[] {
  const parts = value
    .split(/(?<=[.!?׃])\s+/)
    .map(clean)
    .filter(Boolean);
  return parts.length > 1 ? parts : [value];
}

function splitLong(value: string, maxPieces: number): string[] {
  if (maxPieces <= 1 || value.length < 180) return [value];
  const pieces = value
    .split(/[,;]\s+/)
    .map(clean)
    .filter(Boolean);
  if (pieces.length < 2) return [value];
  const groups = Math.min(maxPieces, pieces.length, 4);
  const size = Math.ceil(pieces.length / groups);
  const grouped: string[] = [];
  for (let index = 0; index < pieces.length && grouped.length < groups; index += size) {
    grouped.push(pieces.slice(index, index + size).join(", "));
  }
  return grouped;
}

function extractParts(raw: string): string[] {
  const source = raw.replace(/\r/g, "").trim();
  if (!source) return [];

  let parts = source
    .split(/\n+/)
    .map((line) => clean(line.replace(BULLET, "")))
    .filter(Boolean);

  if (parts.length === 1) {
    const sentences = splitSentences(parts[0]).map(clean).filter(Boolean);
    if (sentences.length > 1) parts = sentences;
  }

  const expanded: string[] = [];
  for (const part of parts) {
    const room = Math.max(1, 4 - expanded.length);
    if (part.length > 180 && expanded.length < 4) {
      expanded.push(...splitLong(part, room));
    } else {
      expanded.push(part);
    }
  }
  return expanded.filter(Boolean);
}

export function summaryLineCount(value: string): number {
  return value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

/**
 * Turns free notes into at most four short lines.
 * The wording stays the writer's; nothing is added.
 */
export function arrangeSummary(raw: string): string {
  const parts = extractParts(raw);
  if (parts.length === 0) return "";

  const lines =
    parts.length <= 4
      ? parts
      : [...parts.slice(0, 3), parts.slice(3).map(stripEnding).join("; ")];

  return lines.map(finishSentence).filter(Boolean).join("\n");
}
