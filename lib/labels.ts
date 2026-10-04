import type { Lang, LanguageLevel } from "@/lib/types";

export type DocLabels = {
  present: string;
  id: string;
  phone: string;
  email: string;
  city: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  jobs: string;
  education: string;
  military: string;
  skills: string;
  languages: string;
  responsibilities: string;
  achievements: string;
  honors: string;
  fullBagrut: string;
  partialBagrut: string;
  expanded: string;
  nameFallback: string;
  emptyTitle: string;
  emptyBody: string;
  levels: Record<LanguageLevel, string>;
};

const he: DocLabels = {
  present: "היום",
  id: "ת״ז",
  phone: "טלפון",
  email: "דוא״ל",
  city: "עיר מגורים",
  linkedin: "לינקדאין",
  portfolio: "תיק עבודות",
  summary: "תמצית מקצועית",
  jobs: "ניסיון תעסוקתי",
  education: "השכלה",
  military: "שירות צבאי",
  skills: "כישורים ומיומנויות",
  languages: "שפות",
  responsibilities: "תחומי אחריות",
  achievements: "הישגים",
  honors: "בהצטיינות",
  fullBagrut: "בגרות מלאה",
  partialBagrut: "בגרות חלקית",
  expanded: "מקצועות מורחבים",
  nameFallback: "השם יופיע כאן",
  emptyTitle: "המסמך",
  emptyBody: "מלאו את הפרטים, והמסמך נבנה כאן.",
  levels: {
    native: "שפת אם",
    fluent: "שליטה מלאה",
    advanced: "רמה גבוהה",
    intermediate: "רמה בינונית",
    basic: "רמת בסיס",
  },
};

const en: DocLabels = {
  present: "Present",
  id: "ID",
  phone: "Phone",
  email: "Email",
  city: "City",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  summary: "Professional summary",
  jobs: "Experience",
  education: "Education",
  military: "Military service",
  skills: "Skills",
  languages: "Languages",
  responsibilities: "Responsibilities",
  achievements: "Achievements",
  honors: "With honors",
  fullBagrut: "Full matriculation",
  partialBagrut: "Partial matriculation",
  expanded: "Extended subjects",
  nameFallback: "Your name appears here",
  emptyTitle: "The document",
  emptyBody: "Fill in the form and the document builds here.",
  levels: {
    native: "Native",
    fluent: "Fluent",
    advanced: "Advanced",
    intermediate: "Intermediate",
    basic: "Basic",
  },
};

export function docLabels(lang: Lang): DocLabels {
  return lang === "he" ? he : en;
}
