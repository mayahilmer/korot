import { translatePlain } from "@/lib/machine-translate";
import type { CvData, CvMemory, CvSnapshot, Lang, Skill } from "@/lib/types";

export type TextTranslator = (texts: string[], target: Lang) => Promise<string[]>;

export function emptyMemory(): CvMemory {
  return { he: null, en: null };
}

export function snapshotFrom(cv: CvData): CvSnapshot {
  return {
    personal: { ...cv.personal },
    summary: cv.summary,
    jobs: cv.jobs.map((job) => ({ ...job })),
    education: cv.education.map((item) => ({ ...item })),
    military: cv.military.map((item) => ({ ...item })),
    skills: cv.skills.map((skill) => ({ ...skill })),
    languages: cv.languages.map((item) => ({ ...item })),
  };
}

export function hashSnapshot(snap: CvSnapshot): string {
  const text = JSON.stringify(snap);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function applySnapshot(cv: CvData, snap: CvSnapshot, lang: Lang, memory: CvMemory): CvData {
  return {
    ...cv,
    lang,
    personal: snap.personal,
    summary: snap.summary,
    jobs: snap.jobs,
    education: snap.education,
    military: snap.military,
    skills: snap.skills,
    languages: snap.languages,
    memory,
  };
}

async function browserTranslate(texts: string[], target: Lang): Promise<string[]> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target }),
  });
  const payload = (await response.json().catch(() => null)) as { texts?: string[]; error?: string } | null;
  if (!response.ok || !payload?.texts || payload.texts.length !== texts.length) {
    throw new Error(payload?.error || "translate");
  }
  return payload.texts;
}

async function translateSnapshot(snap: CvSnapshot, target: Lang, translate: TextTranslator): Promise<CvSnapshot> {
  const next = structuredClone(snap);
  const values: string[] = [];
  const write: Array<(value: string) => void> = [];
  const add = (value: string, apply: (value: string) => void) => {
    values.push(value);
    write.push(apply);
  };

  add(next.personal.fullName, (value) => {
    next.personal.fullName = value;
  });
  add(next.personal.city, (value) => {
    next.personal.city = value;
  });
  add(next.summary, (value) => {
    next.summary = value;
  });
  for (const job of next.jobs) {
    add(job.title, (value) => {
      job.title = value;
    });
    add(job.company, (value) => {
      job.company = value;
    });
    add(job.details, (value) => {
      job.details = value;
    });
    add(job.responsibilities, (value) => {
      job.responsibilities = value;
    });
    add(job.achievements, (value) => {
      job.achievements = value;
    });
  }
  for (const item of next.education) {
    add(item.institution, (value) => {
      item.institution = value;
    });
    add(item.credential, (value) => {
      item.credential = value;
    });
    add(item.expandedSubjects, (value) => {
      item.expandedSubjects = value;
    });
  }
  for (const item of next.military) {
    add(item.role, (value) => {
      item.role = value;
    });
    add(item.base, (value) => {
      item.base = value;
    });
  }
  for (const skill of next.skills) {
    add(skill.name, (value) => {
      skill.name = value;
    });
  }
  for (const item of next.languages) {
    add(item.name, (value) => {
      item.name = value;
    });
  }

  const translated = await translate(values, target);
  if (translated.length !== values.length) throw new Error("translate");
  translated.forEach((value, index) => write[index](value));
  next.skills = mergePresetNames(snap.skills, next.skills);
  return next;
}

function mergePresetNames(before: Skill[], after: Skill[]): Skill[] {
  return after.map((skill, index) => {
    const original = before[index];
    if (!original || original.custom) return skill;
    return { ...skill, name: original.name };
  });
}

export async function switchLanguage(
  cv: CvData,
  target: Lang,
  translate: TextTranslator = browserTranslate,
): Promise<CvData> {
  if (target === cv.lang) return cv;
  const memory: CvMemory = {
    he: cv.memory?.he ?? null,
    en: cv.memory?.en ?? null,
  };
  const current = snapshotFrom(cv);
  const previous = memory[cv.lang];
  const source = { snap: current, basedOn: previous?.basedOn ?? "user" };
  memory[cv.lang] = source;
  const sourceHash = hashSnapshot(current);
  const stored = memory[target];
  const targetHash = stored ? hashSnapshot(stored.snap) : "";
  const returnToOriginal =
    stored?.basedOn === "user" && source.basedOn === targetHash;
  const sameSource = stored?.basedOn === sourceHash;
  if (stored && (returnToOriginal || sameSource)) {
    return applySnapshot(cv, stored.snap, target, memory);
  }

  const translated = await translateSnapshot(source.snap, target, async (texts, lang) => {
    const unique = [...new Set(texts)];
    const rendered = await translate(unique, lang);
    if (rendered.length !== unique.length) throw new Error("translate");
    const table = new Map(unique.map((text, index) => [text, rendered[index]]));
    return texts.map((text, index) => table.get(text) ?? rendered[index] ?? text);
  });
  memory[target] = { snap: translated, basedOn: sourceHash };
  return applySnapshot(cv, translated, target, memory);
}

export async function translateAll(texts: string[], target: Lang): Promise<string[]> {
  const out: string[] = [];
  for (const text of texts) out.push(await translatePlain(text, target));
  return out;
}
