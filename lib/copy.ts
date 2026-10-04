import type { EducationKind, Lang, LanguageLevel } from "@/lib/types";

export type Copy = {
  brand: string;
  tagline: string;
  sample: string;
  clear: string;
  clearConfirm: string;
  cancel: string;
  downloadPdf: string;
  downloadWord: string;
  downloading: string;
  alsoPdf: string;
  alsoWord: string;
  edit: string;
  preview: string;
  previewCaption: string;
  nameRequired: string;
  exportFailed: string;
  localNote: string;
  document: string;
  documentHint: string;
  fileType: string;
  language: string;
  languageHint: string;
  translating: string;
  translateFailed: string;
  font: string;
  fontHint: string;
  personal: string;
  personalHint: string;
  fullName: string;
  idNumber: string;
  idHint: string;
  phone: string;
  email: string;
  emailHint: string;
  city: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  summaryHint: string;
  summaryPlaceholder: string;
  arrange: string;
  undo: string;
  arranged: (count: number) => string;
  alreadyArranged: string;
  addAnotherLine: string;
  jobs: string;
  jobsHint: string;
  jobsEmpty: string;
  addJob: string;
  jobFallback: string;
  role: string;
  company: string;
  from: string;
  to: string;
  month: string;
  year: string;
  currentJob: string;
  details: string;
  responsibilities: string;
  achievements: string;
  detailsPlaceholder: string;
  responsibilitiesPlaceholder: string;
  achievementsPlaceholder: string;
  remove: string;
  dateOrder: string;
  education: string;
  educationHint: string;
  educationEmpty: string;
  addEducation: string;
  educationFallback: string;
  kind: string;
  kinds: Record<EducationKind, string>;
  institution: string;
  school: string;
  credential: string;
  credentialAcademic: string;
  credentialCertificate: string;
  credentialSchool: string;
  currentStudy: string;
  honors: string;
  fullBagrut: string;
  expanded: string;
  expandedPlaceholder: string;
  hiddenSchool: string;
  military: string;
  militaryHint: string;
  militaryEmpty: string;
  addMilitary: string;
  militaryFallback: string;
  militaryRole: string;
  serviceKind: string;
  serviceMilitary: string;
  serviceNational: string;
  base: string;
  placement: string;
  currentService: string;
  skills: string;
  skillsHint: string;
  skillPlaceholder: string;
  addSkill: string;
  languages: string;
  languagesHint: string;
  languagesEmpty: string;
  languageName: string;
  level: string;
  addLanguage: string;
  levels: Record<LanguageLevel, string>;
  suggestions: string[];
};

const he: Copy = {
  brand: "קורות",
  tagline: "מסמך קורות חיים נקי, לפי הסדר הנכון.",
  sample: "הצגת דוגמה",
  clear: "ניקוי",
  clearConfirm: "למחוק את מה שכתבתם?",
  cancel: "ביטול",
  downloadPdf: "הורדת PDF",
  downloadWord: "הורדת Word",
  downloading: "מכינים את הקובץ…",
  alsoPdf: "או PDF",
  alsoWord: "או Word",
  edit: "עריכה",
  preview: "תצוגה",
  previewCaption: "תצוגה מקדימה",
  nameRequired: "חסר שם מלא. בלי שם המסמך לא מוכן.",
  exportFailed: "לא הצלחנו ליצור את הקובץ.",
  localNote: "הטיוטה נשמרת בדפדפן הזה. השרת רק מרכיב את הקובץ, ולא שומר אותו.",
  document: "המסמך",
  documentHint: "קודם בוחרים קובץ, שפה ופונט. אחר כך ממלאים.",
  fileType: "סוג קובץ",
  language: "שפה",
  languageHint: "במעבר לאנגלית, מה שכתבתם בעברית מתורגם לאנגלית מסודרת. החזרה לעברית מחזירה את הנוסח המקורי.",
  translating: "מתרגמים את המסמך…",
  translateFailed: "התרגום לא הושלם. נסו שוב.",
  font: "פונט",
  fontHint: "David לעברית קלאסית. Arial למסמך נקי ומודרני.",
  personal: "פרטים אישיים",
  personalHint: "מה שנשאר ריק לא נכנס למסמך.",
  fullName: "שם מלא",
  idNumber: "ת״ז",
  idHint: "9 ספרות. לא חובה.",
  phone: "טלפון",
  email: "דוא״ל",
  emailHint: "הכתובת לא נראית שלמה.",
  city: "עיר מגורים",
  linkedin: "לינקדאין",
  portfolio: "תיק עבודות",
  summary: "תמצית מקצועית",
  summaryHint: "לא חובה. הכפתור מקצר מילים חוזרות ומסדר ל־3–4 שורות, בלי להוסיף עובדות.",
  summaryPlaceholder: "תפקיד, שנות ניסיון, תחום, והישג אחד שאפשר למדוד.",
  arrange: "קיצור ל־3–4 שורות",
  undo: "שחזור הטקסט הקודם",
  arranged: (count) => `סודר ל־${count} שורות.`,
  alreadyArranged: "הטקסט כבר מסודר.",
  addAnotherLine: "אפשר להוסיף עוד נקודה כדי להתקרב ל־3–4 שורות.",
  jobs: "ניסיון תעסוקתי",
  jobsHint: "במסמך, מה שמאוחר יותר מופיע קודם.",
  jobsEmpty: "עוד אין כאן מקומות עבודה.",
  addJob: "הוספת מקום עבודה",
  jobFallback: "מקום עבודה",
  role: "עיסוק",
  company: "שם החברה",
  from: "מחודש ושנה",
  to: "עד חודש ושנה",
  month: "חודש",
  year: "שנה",
  currentJob: "עדיין בתפקיד",
  details: "פירוט העיסוק",
  responsibilities: "תחומי אחריות",
  achievements: "הישגים מדידים",
  detailsPlaceholder: "במה עסקתם בפועל.",
  responsibilitiesPlaceholder: "על מה הייתם אחראים.",
  achievementsPlaceholder: "מספר, אחוז, או תוצאה שאפשר לבדוק.",
  remove: "הסרה",
  dateOrder: "תאריך הסיום מוקדם מתאריך ההתחלה.",
  education: "השכלה",
  educationHint:
    "אם יש תואר אקדמי, לימודי התיכון לא נכנסים למסמך. בלי תואר אפשר לציין בגרות, שם תיכון ומקצועות מורחבים.",
  educationEmpty: "עוד אין כאן השכלה.",
  addEducation: "הוספת השכלה",
  educationFallback: "לימודים",
  kind: "סוג",
  kinds: {
    academic: "תואר אקדמי",
    certificate: "תעודה או קורס",
    highschool: "תיכון",
  },
  institution: "מוסד לימודים",
  school: "שם התיכון",
  credential: "תואר או תעודה",
  credentialAcademic: "למשל: תואר ראשון בניהול",
  credentialCertificate: "למשל: קורס הנהלת חשבונות",
  credentialSchool: "למשל: בגרות",
  currentStudy: "עדיין לומד",
  honors: "סיום בהצטיינות",
  fullBagrut: "בגרות מלאה",
  expanded: "מקצועות מורחבים",
  expandedPlaceholder: "מתמטיקה, אנגלית",
  hiddenSchool: "לא ייכנס למסמך, כי כבר יש תואר אקדמי.",
  military: "שירות צבאי או לאומי",
  militaryHint: "בוחרים צבאי או לאומי לכל שירות. אם אין מה לכתוב, הסעיף לא יופיע.",
  militaryEmpty: "אפשר להשאיר את זה ריק.",
  addMilitary: "הוספת שירות",
  militaryFallback: "שירות",
  militaryRole: "תפקיד",
  serviceKind: "סוג השירות",
  serviceMilitary: "צבאי",
  serviceNational: "לאומי",
  base: "בסיס",
  placement: "מקום השירות",
  currentService: "עדיין בשירות",
  skills: "כישורים ומיומנויות",
  skillsHint: "מסמנים V ליד תוכנות ששולטים בהן. אפשר להוסיף עוד.",
  skillPlaceholder: "תוכנה נוספת",
  addSkill: "הוספה",
  languages: "שפות",
  languagesHint: "שם השפה ורמת השליטה.",
  languagesEmpty: "עוד אין כאן שפות.",
  languageName: "שפה",
  level: "רמת שליטה",
  addLanguage: "הוספת שפה",
  levels: {
    native: "שפת אם",
    fluent: "שליטה מלאה",
    advanced: "רמה גבוהה",
    intermediate: "רמה בינונית",
    basic: "רמת בסיס",
  },
  suggestions: ["עברית", "אנגלית", "ערבית", "רוסית", "צרפתית", "ספרדית", "אמהרית"],
};

const en: Copy = {
  brand: "Korot",
  tagline: "A clean résumé, in the right order.",
  sample: "Show an example",
  clear: "Clear",
  clearConfirm: "Delete what you wrote?",
  cancel: "Cancel",
  downloadPdf: "Download PDF",
  downloadWord: "Download Word",
  downloading: "Preparing the file…",
  alsoPdf: "or PDF",
  alsoWord: "or Word",
  edit: "Edit",
  preview: "Preview",
  previewCaption: "Preview",
  nameRequired: "A full name is required before the file can be made.",
  exportFailed: "The file could not be made.",
  localNote: "The draft stays in this browser. The server only builds the file and does not keep it.",
  document: "Document",
  documentHint: "Choose the file, the language, and the font. Then fill in the rest.",
  fileType: "File type",
  language: "Language",
  languageHint: "Choosing English translates a Hebrew form into polished English. Choosing Hebrew brings back the original wording.",
  translating: "Translating the document…",
  translateFailed: "The translation did not finish. Try again.",
  font: "Font",
  fontHint: "David is a classic Hebrew text face. Arial is a clean modern one.",
  personal: "Personal details",
  personalHint: "Empty fields stay off the document.",
  fullName: "Full name",
  idNumber: "ID number",
  idHint: "9 digits. Optional.",
  phone: "Phone",
  email: "Email",
  emailHint: "This address looks incomplete.",
  city: "City",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  summary: "Professional summary",
  summaryHint: "Optional. The button removes repeated words and fits the notes into 3–4 lines. It does not add facts.",
  summaryPlaceholder: "Role, years, field, and one result you can measure.",
  arrange: "Shorten to 3–4 lines",
  undo: "Restore the previous text",
  arranged: (count) => `Arranged into ${count} lines.`,
  alreadyArranged: "The text is already arranged.",
  addAnotherLine: "Add another point if you want to reach 3–4 lines.",
  jobs: "Experience",
  jobsHint: "Later roles appear first in the document.",
  jobsEmpty: "No roles yet.",
  addJob: "Add a role",
  jobFallback: "Role",
  role: "Role",
  company: "Company",
  from: "From",
  to: "To",
  month: "Month",
  year: "Year",
  currentJob: "Still in this role",
  details: "What the work was",
  responsibilities: "Responsibilities",
  achievements: "Measurable results",
  detailsPlaceholder: "What you actually did.",
  responsibilitiesPlaceholder: "What you were responsible for.",
  achievementsPlaceholder: "A number, a rate, or a result someone can check.",
  remove: "Remove",
  dateOrder: "The end date is earlier than the start date.",
  education: "Education",
  educationHint:
    "Once there is an academic degree, high school stays off the document. Without a degree, you can list matriculation, the school, and extended subjects.",
  educationEmpty: "No studies yet.",
  addEducation: "Add studies",
  educationFallback: "Studies",
  kind: "Type",
  kinds: {
    academic: "Academic degree",
    certificate: "Certificate or course",
    highschool: "High school",
  },
  institution: "Institution",
  school: "School",
  credential: "Degree or certificate",
  credentialAcademic: "For example: B.A. in Management",
  credentialCertificate: "For example: bookkeeping course",
  credentialSchool: "For example: matriculation",
  currentStudy: "Still studying",
  honors: "Graduated with honors",
  fullBagrut: "Full matriculation",
  expanded: "Extended subjects",
  expandedPlaceholder: "Mathematics, English",
  hiddenSchool: "This stays off the document because an academic degree is already listed.",
  military: "Military or national service",
  militaryHint: "Mark each entry as military or national service. An empty section stays off the document.",
  militaryEmpty: "You can leave this empty.",
  addMilitary: "Add service",
  militaryFallback: "Service",
  militaryRole: "Role",
  serviceKind: "Type of service",
  serviceMilitary: "Military",
  serviceNational: "National",
  base: "Base",
  placement: "Place of service",
  currentService: "Still serving",
  skills: "Skills",
  skillsHint: "Mark the tools you can use. You can add more.",
  skillPlaceholder: "Another tool",
  addSkill: "Add",
  languages: "Languages",
  languagesHint: "The language and how well you use it.",
  languagesEmpty: "No languages yet.",
  languageName: "Language",
  level: "Level",
  addLanguage: "Add a language",
  levels: {
    native: "Native",
    fluent: "Fluent",
    advanced: "Advanced",
    intermediate: "Intermediate",
    basic: "Basic",
  },
  suggestions: ["Hebrew", "English", "Arabic", "Russian", "French", "Spanish", "Amharic"],
};

export function copyFor(lang: Lang): Copy {
  return lang === "he" ? he : en;
}
