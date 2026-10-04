import { chronologyKey, formatSpan, formatYears } from "@/lib/dates";
import { docxFontName, fontFamily } from "@/lib/fonts";
import { docLabels } from "@/lib/labels";
import { displayUrl, safeHref } from "@/lib/text";
import type {
  CvData,
  CvItem,
  CvLine,
  CvMemory,
  CvSnapshot,
  CvView,
  Education,
  EducationKind,
  ExportFormat,
  FontChoice,
  Job,
  Lang,
  LanguageLevel,
  LanguageSkill,
  Military,
  Personal,
  ServiceKind,
  Skill,
  StoredEdition,
} from "@/lib/types";

export const SKILL_PRESETS = [
  "Office",
  "Excel",
  "Word",
  "PowerPoint",
  "Salesforce",
  "Python",
  "Photoshop",
  "Figma",
  "SQL",
  "SAP",
  "Google Workspace",
  "JavaScript",
] as const;

const LEVELS: LanguageLevel[] = [
  "native",
  "fluent",
  "advanced",
  "intermediate",
  "basic",
];

const KINDS: EducationKind[] = ["academic", "certificate", "highschool"];

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function blankPersonal(): Personal {
  return {
    fullName: "",
    idNumber: "",
    phone: "",
    email: "",
    city: "",
    linkedin: "",
    portfolio: "",
  };
}

export function blankJob(): Job {
  return {
    id: createId(),
    title: "",
    company: "",
    fromMonth: "",
    fromYear: "",
    toMonth: "",
    toYear: "",
    current: false,
    details: "",
    responsibilities: "",
    achievements: "",
  };
}

export function blankEducation(kind: EducationKind = "academic"): Education {
  return {
    id: createId(),
    kind,
    institution: "",
    credential: "",
    fromYear: "",
    toYear: "",
    current: false,
    honors: false,
    fullBagrut: false,
    expandedSubjects: "",
  };
}

export function blankMilitary(kind: ServiceKind = "military"): Military {
  return {
    id: createId(),
    kind,
    role: "",
    base: "",
    fromYear: "",
    toYear: "",
    current: false,
  };
}

export function blankLanguage(name = "", level: LanguageLevel = "advanced"): LanguageSkill {
  return { id: createId(), name, level };
}

export function presetSkills(): Skill[] {
  return SKILL_PRESETS.map((name) => ({
    id: `skill-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    selected: false,
  }));
}

export function emptyCv(): CvData {
  return {
    format: "pdf",
    lang: "he",
    font: "david",
    personal: blankPersonal(),
    summary: "",
    jobs: [],
    education: [],
    military: [],
    skills: presetSkills(),
    languages: [],
    memory: { he: null, en: null },
  };
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function flag(value: unknown): boolean {
  return value === true;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeJob(value: unknown): Job | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: text(record.id) || createId(),
    title: text(record.title),
    company: text(record.company),
    fromMonth: text(record.fromMonth),
    fromYear: text(record.fromYear),
    toMonth: text(record.toMonth),
    toYear: text(record.toYear),
    current: flag(record.current),
    details: text(record.details),
    responsibilities: text(record.responsibilities),
    achievements: text(record.achievements),
  };
}

function normalizeEducation(value: unknown): Education | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: text(record.id) || createId(),
    kind: oneOf(record.kind, KINDS, "academic"),
    institution: text(record.institution),
    credential: text(record.credential),
    fromYear: text(record.fromYear),
    toYear: text(record.toYear),
    current: flag(record.current),
    honors: flag(record.honors),
    fullBagrut: flag(record.fullBagrut),
    expandedSubjects: text(record.expandedSubjects),
  };
}

function normalizeMilitary(value: unknown): Military | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: text(record.id) || createId(),
    kind: oneOf<ServiceKind>(record.kind, ["military", "national"], "military"),
    role: text(record.role),
    base: text(record.base),
    fromYear: text(record.fromYear),
    toYear: text(record.toYear),
    current: flag(record.current),
  };
}

function normalizeLanguage(value: unknown): LanguageSkill | null {
  const record = asRecord(value);
  if (!record) return null;
  const name = text(record.name);
  if (!name.trim()) return null;
  return {
    id: text(record.id) || createId(),
    name,
    level: oneOf(record.level, LEVELS, "advanced"),
  };
}

function normalizeSkills(value: unknown): Skill[] {
  const saved = Array.isArray(value) ? value : [];
  const presets = presetSkills();
  const byId = new Map(presets.map((skill) => [skill.id, skill]));
  const byName = new Map(presets.map((skill) => [skill.name.toLowerCase(), skill]));
  const custom: Skill[] = [];

  for (const item of saved) {
    const record = asRecord(item);
    if (!record) continue;
    const name = text(record.name).trim();
    if (!name) continue;
    const selected = flag(record.selected);
    const preset = byId.get(text(record.id)) ?? byName.get(name.toLowerCase());
    if (preset) {
      preset.selected = selected;
      continue;
    }
    custom.push({
      id: text(record.id) || createId(),
      name,
      selected,
      custom: true,
    });
  }

  return [...presets, ...custom];
}

export function normalizeCv(value: unknown): CvData {
  const record = asRecord(value);
  if (!record) return emptyCv();
  const personal = asRecord(record.personal) ?? {};
  const base = emptyCv();

  return {
    format: oneOf<ExportFormat>(record.format, ["pdf", "docx"], "pdf"),
    lang: oneOf<Lang>(record.lang, ["he", "en"], "he"),
    font: oneOf<FontChoice>(record.font, ["david", "arial"], "david"),
    personal: {
      fullName: text(personal.fullName),
      idNumber: text(personal.idNumber),
      phone: text(personal.phone),
      email: text(personal.email),
      city: text(personal.city),
      linkedin: text(personal.linkedin),
      portfolio: text(personal.portfolio),
    },
    summary: text(record.summary),
    jobs: Array.isArray(record.jobs)
      ? record.jobs.map(normalizeJob).filter((item): item is Job => item !== null)
      : base.jobs,
    education: Array.isArray(record.education)
      ? record.education
          .map(normalizeEducation)
          .filter((item): item is Education => item !== null)
      : base.education,
    military: Array.isArray(record.military)
      ? record.military
          .map(normalizeMilitary)
          .filter((item): item is Military => item !== null)
      : base.military,
    skills: normalizeSkills(record.skills),
    languages: Array.isArray(record.languages)
      ? record.languages
          .map(normalizeLanguage)
          .filter((item): item is LanguageSkill => item !== null)
      : base.languages,
    memory: normalizeMemory(record.memory),
  };
}

function normalizeSnapshot(value: unknown): CvSnapshot | null {
  const record = asRecord(value);
  if (!record) return null;
  const personal = asRecord(record.personal) ?? {};
  return {
    personal: {
      fullName: text(personal.fullName),
      idNumber: text(personal.idNumber),
      phone: text(personal.phone),
      email: text(personal.email),
      city: text(personal.city),
      linkedin: text(personal.linkedin),
      portfolio: text(personal.portfolio),
    },
    summary: text(record.summary),
    jobs: Array.isArray(record.jobs)
      ? record.jobs.map(normalizeJob).filter((item): item is Job => item !== null)
      : [],
    education: Array.isArray(record.education)
      ? record.education.map(normalizeEducation).filter((item): item is Education => item !== null)
      : [],
    military: Array.isArray(record.military)
      ? record.military.map(normalizeMilitary).filter((item): item is Military => item !== null)
      : [],
    skills: normalizeSkills(record.skills),
    languages: Array.isArray(record.languages)
      ? record.languages.map(normalizeLanguage).filter((item): item is LanguageSkill => item !== null)
      : [],
  };
}

function normalizeEdition(value: unknown): StoredEdition | null {
  const record = asRecord(value);
  if (!record) return null;
  const snap = normalizeSnapshot(record.snap);
  if (!snap) return null;
  return { snap, basedOn: text(record.basedOn) || "user" };
}

function normalizeMemory(value: unknown): CvMemory {
  const record = asRecord(value);
  if (!record) return { he: null, en: null };
  return {
    he: normalizeEdition(record.he),
    en: normalizeEdition(record.en),
  };
}

function filled(...values: string[]): boolean {
  return values.some((value) => value.trim().length > 0);
}

function sortByChronology<T>(
  items: T[],
  keyOf: (item: T) => number,
): T[] {
  return items
    .map((item, index) => ({ item, index, key: keyOf(item) }))
    .sort((a, b) => b.key - a.key || a.index - b.index)
    .map((entry) => entry.item);
}

function line(label: string | undefined, value: string): CvLine[] {
  const textValue = value.trim();
  if (!textValue) return [];
  return [{ label, text: textValue }];
}

function jobHasContent(job: Job): boolean {
  return filled(
    job.title,
    job.company,
    job.details,
    job.responsibilities,
    job.achievements,
    job.fromYear,
    job.toYear,
  );
}

function educationHasContent(item: Education): boolean {
  return (
    filled(item.institution, item.credential, item.fromYear, item.toYear, item.expandedSubjects) ||
    item.honors ||
    item.fullBagrut
  );
}

export function hasAcademicEducation(items: Education[]): boolean {
  return items.some((item) => item.kind === "academic" && educationHasContent(item));
}

function toJobItem(job: Job, lang: Lang, present: string, labels: ReturnType<typeof docLabels>): CvItem {
  return {
    heading: job.title.trim(),
    dates: formatSpan(
      job.fromMonth,
      job.fromYear,
      job.toMonth,
      job.toYear,
      job.current,
      lang,
      present,
    ),
    meta: job.company.trim(),
    lines: [
      ...line(undefined, job.details),
      ...line(labels.responsibilities, job.responsibilities),
      ...line(labels.achievements, job.achievements),
    ],
  };
}

function toEducationItem(item: Education, present: string, labels: ReturnType<typeof docLabels>): CvItem {
  const dates = formatYears(item.fromYear, item.toYear, item.current, present);
  const lines: CvLine[] = [];

  if (item.kind === "highschool") {
    if (item.fullBagrut || item.credential.trim()) {
      lines.push({
        text: item.fullBagrut ? labels.fullBagrut : labels.partialBagrut,
      });
    }
    lines.push(...line(labels.expanded, item.expandedSubjects));
    const heading = item.credential.trim() || (item.fullBagrut ? labels.fullBagrut : labels.partialBagrut);
    if (lines[0]?.text === heading) lines.shift();
    return {
      heading,
      dates,
      meta: item.institution.trim(),
      lines,
    };
  }

  if (item.honors) lines.push({ text: labels.honors });
  return {
    heading: item.credential.trim(),
    dates,
    meta: item.institution.trim(),
    lines,
  };
}

export function toView(cv: CvData): CvView {
  const labels = docLabels(cv.lang);
  const personal = cv.personal;

  const contacts: CvView["contacts"] = [];
  const push = (label: string, value: string, href?: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    contacts.push({ label, value: trimmed, href });
  };

  push(labels.id, personal.idNumber);
  push(labels.phone, personal.phone, safeHref("tel", personal.phone));
  push(labels.email, personal.email, safeHref("mail", personal.email));
  push(labels.city, personal.city);
  const linkedin = safeHref("web", personal.linkedin);
  if (personal.linkedin.trim()) {
    contacts.push({
      label: labels.linkedin,
      value: displayUrl(personal.linkedin),
      href: linkedin,
    });
  }
  const portfolio = safeHref("web", personal.portfolio);
  if (personal.portfolio.trim()) {
    contacts.push({
      label: labels.portfolio,
      value: displayUrl(personal.portfolio),
      href: portfolio,
    });
  }

  const summaryText = cv.summary.trim();
  const jobs = sortByChronology(
    cv.jobs.filter(jobHasContent),
    (job) =>
      chronologyKey(job.fromMonth, job.fromYear, job.toMonth, job.toYear, job.current),
  ).map((job) => toJobItem(job, cv.lang, labels.present, labels));

  const academic = hasAcademicEducation(cv.education);
  const education = sortByChronology(
    cv.education.filter((item) => {
      if (!educationHasContent(item)) return false;
      if (academic && item.kind === "highschool") return false;
      return true;
    }),
    (item) => chronologyKey("", item.fromYear, "", item.toYear, item.current),
  ).map((item) => toEducationItem(item, labels.present, labels));

  const militaryItems = sortByChronology(
    cv.military.filter((item) => filled(item.role, item.base, item.fromYear, item.toYear)),
    (item) => chronologyKey("", item.fromYear, "", item.toYear, item.current),
  );
  const serviceKinds = new Set(militaryItems.map((item) => item.kind));
  const mixedService = serviceKinds.has("military") && serviceKinds.has("national");
  const military = militaryItems.map((item) => {
    const place = item.base.trim();
    const kindLabel = item.kind === "national" ? labels.national : labels.military;
    return {
      heading: item.role.trim(),
      dates: formatYears(item.fromYear, item.toYear, item.current, labels.present),
      meta: mixedService ? [kindLabel, place].filter(Boolean).join(" · ") : place,
      lines: [],
    };
  });
  const militaryTitle =
    serviceKinds.has("military") && serviceKinds.has("national")
      ? labels.militaryAndNational
      : serviceKinds.has("national")
        ? labels.national
        : labels.military;

  const skills = cv.skills.filter((skill) => skill.selected && skill.name.trim()).map((skill) => skill.name.trim());
  const languages = cv.languages
    .filter((item) => item.name.trim())
    .map((item) => ({ name: item.name.trim(), level: labels.levels[item.level] }));

  const summary = summaryText ? { title: labels.summary, text: summaryText } : null;
  const jobsBlock = jobs.length ? { title: labels.jobs, items: jobs } : null;
  const educationBlock = education.length ? { title: labels.education, items: education } : null;
  const militaryBlock = military.length ? { title: militaryTitle, items: military } : null;
  const skillsBlock = skills.length ? { title: labels.skills, items: skills } : null;
  const languagesBlock = languages.length ? { title: labels.languages, items: languages } : null;
  const name = personal.fullName.trim();
  const empty =
    !name &&
    contacts.length === 0 &&
    !summary &&
    !jobsBlock &&
    !educationBlock &&
    !militaryBlock &&
    !skillsBlock &&
    !languagesBlock;

  return {
    lang: cv.lang,
    dir: cv.lang === "he" ? "rtl" : "ltr",
    font: cv.font,
    fontFamily: fontFamily(cv.font),
    docxFont: docxFontName(cv.font),
    empty,
    emptyTitle: labels.emptyTitle,
    emptyBody: labels.emptyBody,
    name,
    nameFallback: labels.nameFallback,
    contacts,
    summary,
    jobs: jobsBlock,
    education: educationBlock,
    military: militaryBlock,
    skills: skillsBlock,
    languages: languagesBlock,
  };
}

export function sampleCv(lang: Lang, keep?: Pick<CvData, "format" | "font">): CvData {
  if (lang === "en") return englishSample(keep);
  return hebrewSample(keep);
}

function hebrewSample(keep?: Pick<CvData, "format" | "font">): CvData {
  const cv = emptyCv();
  cv.format = keep?.format ?? "pdf";
  cv.font = keep?.font ?? "david";
  cv.lang = "he";
  cv.personal = {
    fullName: "נועה ברק",
    idNumber: "000000018",
    phone: "050-000-0000",
    email: "noa@example.com",
    city: "תל אביב",
    linkedin: "linkedin.com/in/example",
    portfolio: "example.com",
  };
  cv.summary = [
    "מנהלת תפעול עם ניסיון בהובלת צוות ושיפור תהליכי הפצה.",
    "אחראית על מחסן אזורי, על ספקים ועל בקרת מלאי שוטפת.",
    "קיצרתי זמן אספקה מ־48 שעות ל־30 שעות בלי להגדיל את הצוות.",
  ].join("\n");
  cv.jobs = [
    {
      id: "job-shaked",
      title: "מנהלת תפעול",
      company: "שקד לוגיסטיקה",
      fromMonth: "3",
      fromYear: "2022",
      toMonth: "",
      toYear: "",
      current: true,
      details: "ניהול שוטף של מחסן והפצה באזור המרכז.",
      responsibilities: "צוות של 12 עובדים, תכנון משמרות ובקרת מלאי.",
      achievements: "קיצור זמן אספקה מ־48 שעות ל־30 שעות.",
    },
    {
      id: "job-milou",
      title: "רכזת תפעול",
      company: "מילוא אריזות",
      fromMonth: "6",
      fromYear: "2019",
      toMonth: "2",
      toYear: "2022",
      current: false,
      details: "תיאום הזמנות בין המחסן, המכירות והלקוחות.",
      responsibilities: "מעקב אחרי הזמנות חריגות ודיווח שבועי להנהלה.",
      achievements: "ירידה של 22% בהזמנות שחזרו בגלל ליקוט שגוי.",
    },
  ];
  cv.education = [
    {
      id: "edu-degree",
      kind: "academic",
      institution: "המכללה למנהל",
      credential: "תואר ראשון בניהול",
      fromYear: "2016",
      toYear: "2019",
      current: false,
      honors: true,
      fullBagrut: false,
      expandedSubjects: "",
    },
    {
      id: "edu-school",
      kind: "highschool",
      institution: "תיכון עירוני א׳",
      credential: "בגרות",
      fromYear: "2008",
      toYear: "2011",
      current: false,
      honors: false,
      fullBagrut: true,
      expandedSubjects: "מתמטיקה, אנגלית",
    },
  ];
  cv.military = [
    {
      id: "mil-1",
      kind: "military",
      role: "משקית שלישות",
      base: "בסיס תל השומר",
      fromYear: "2012",
      toYear: "2015",
      current: false,
    },
    {
      id: "nat-1",
      kind: "national",
      role: "מדריכה",
      base: "בית חולים שיבא",
      fromYear: "2011",
      toYear: "2012",
      current: false,
    },
  ];
  for (const name of ["Office", "Excel", "Salesforce", "Python"]) {
    const skill = cv.skills.find((item) => item.name === name);
    if (skill) skill.selected = true;
  }
  cv.languages = [
    { id: "lang-he", name: "עברית", level: "native" },
    { id: "lang-en", name: "אנגלית", level: "advanced" },
  ];
  return cv;
}

function englishSample(keep?: Pick<CvData, "format" | "font">): CvData {
  const cv = emptyCv();
  cv.format = keep?.format ?? "pdf";
  cv.font = keep?.font ?? "arial";
  cv.lang = "en";
  cv.personal = {
    fullName: "Noa Barak",
    idNumber: "",
    phone: "+972-50-000-0000",
    email: "noa@example.com",
    city: "Tel Aviv",
    linkedin: "linkedin.com/in/example",
    portfolio: "example.com",
  };
  cv.summary = [
    "Operations manager experienced in leading teams and tightening distribution.",
    "Responsible for a regional warehouse, suppliers, and day-to-day inventory control.",
    "Cut delivery time from 48 hours to 30 hours without growing the team.",
  ].join("\n");
  cv.jobs = [
    {
      id: "job-shaked",
      title: "Operations Manager",
      company: "Shaked Logistics",
      fromMonth: "3",
      fromYear: "2022",
      toMonth: "",
      toYear: "",
      current: true,
      details: "Day-to-day management of a warehouse and distribution across the center.",
      responsibilities: "A team of 12, shift planning, and inventory control.",
      achievements: "Cut delivery time from 48 hours to 30 hours.",
    },
    {
      id: "job-milou",
      title: "Operations Coordinator",
      company: "Milou Packaging",
      fromMonth: "6",
      fromYear: "2019",
      toMonth: "2",
      toYear: "2022",
      current: false,
      details: "Coordinated orders between the warehouse, sales, and customers.",
      responsibilities: "Tracked exceptions and sent a weekly report to management.",
      achievements: "Reduced mis-picks that caused returns by 22%.",
    },
  ];
  cv.education = [
    {
      id: "edu-degree",
      kind: "academic",
      institution: "College of Management",
      credential: "B.A. in Management",
      fromYear: "2016",
      toYear: "2019",
      current: false,
      honors: true,
      fullBagrut: false,
      expandedSubjects: "",
    },
  ];
  cv.military = [
    {
      id: "mil-1",
      kind: "military",
      role: "Personnel NCO",
      base: "Tel Hashomer",
      fromYear: "2012",
      toYear: "2015",
      current: false,
    },
    {
      id: "nat-1",
      kind: "national",
      role: "Guide",
      base: "Sheba Medical Center",
      fromYear: "2011",
      toYear: "2012",
      current: false,
    },
  ];
  for (const name of ["Office", "Excel", "Salesforce", "Python"]) {
    const skill = cv.skills.find((item) => item.name === name);
    if (skill) skill.selected = true;
  }
  cv.languages = [
    { id: "lang-he", name: "Hebrew", level: "native" },
    { id: "lang-en", name: "English", level: "advanced" },
  ];
  return cv;
}
