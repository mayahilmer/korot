export type Lang = "he" | "en";
export type FontChoice = "david" | "arial";
export type ExportFormat = "pdf" | "docx";
export type EducationKind = "academic" | "certificate" | "highschool";
export type LanguageLevel =
  | "native"
  | "fluent"
  | "advanced"
  | "intermediate"
  | "basic";

export type Personal = {
  fullName: string;
  idNumber: string;
  phone: string;
  email: string;
  city: string;
  linkedin: string;
  portfolio: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  fromMonth: string;
  fromYear: string;
  toMonth: string;
  toYear: string;
  current: boolean;
  details: string;
  responsibilities: string;
  achievements: string;
};

export type Education = {
  id: string;
  kind: EducationKind;
  institution: string;
  credential: string;
  fromYear: string;
  toYear: string;
  current: boolean;
  honors: boolean;
  fullBagrut: boolean;
  expandedSubjects: string;
};

export type Military = {
  id: string;
  role: string;
  base: string;
  fromYear: string;
  toYear: string;
  current: boolean;
};

export type Skill = {
  id: string;
  name: string;
  selected: boolean;
  custom?: boolean;
};

export type LanguageSkill = {
  id: string;
  name: string;
  level: LanguageLevel;
};

export type CvData = {
  format: ExportFormat;
  lang: Lang;
  font: FontChoice;
  personal: Personal;
  summary: string;
  jobs: Job[];
  education: Education[];
  military: Military[];
  skills: Skill[];
  languages: LanguageSkill[];
};

export type CvLine = {
  label?: string;
  text: string;
};

export type CvItem = {
  heading: string;
  dates: string;
  meta: string;
  lines: CvLine[];
};

export type CvContact = {
  label: string;
  value: string;
  href?: string;
};

export type CvView = {
  lang: Lang;
  dir: "rtl" | "ltr";
  font: FontChoice;
  fontFamily: string;
  docxFont: string;
  empty: boolean;
  emptyTitle: string;
  emptyBody: string;
  name: string;
  nameFallback: string;
  contacts: CvContact[];
  summary: { title: string; text: string } | null;
  jobs: { title: string; items: CvItem[] } | null;
  education: { title: string; items: CvItem[] } | null;
  military: { title: string; items: CvItem[] } | null;
  skills: { title: string; items: string[] } | null;
  languages: { title: string; items: { name: string; level: string }[] } | null;
};
