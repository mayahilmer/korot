import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  type IFontAttributesProperties,
} from "docx";
import type { CvItem, CvLine, CvView } from "@/lib/types";

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NONE,
  bottom: NONE,
  left: NONE,
  right: NONE,
  insideHorizontal: NONE,
  insideVertical: NONE,
};

const PAGE_WIDTH = 11906;
const MARGIN = 907;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const DATE_WIDTH = 3120;
const TITLE_WIDTH = CONTENT_WIDTH - DATE_WIDTH;

function face(name: string): IFontAttributesProperties {
  return { ascii: name, hAnsi: name, cs: name, eastAsia: name };
}

type RunOpts = {
  bold?: boolean;
  size?: number;
  color?: string;
  underline?: boolean;
};

export async function buildDocx(view: CvView): Promise<Buffer> {
  const rtl = view.lang === "he";
  const lang = rtl ? "he-IL" : "en-US";
  const font = face(view.docxFont);
  const align = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;

  const run = (text: string, opts: RunOpts = {}) =>
    new TextRun({
      text,
      font,
      size: opts.size ?? 22,
      sizeComplexScript: opts.size ?? 22,
      bold: opts.bold,
      boldComplexScript: opts.bold,
      color: opts.color,
      rightToLeft: rtl,
      language: { value: lang, bidirectional: lang },
      underline: opts.underline ? { type: "single" } : undefined,
    });

  const paragraph = (
    children: (TextRun | ExternalHyperlink)[],
    extra: {
      alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
      before?: number;
      after?: number;
      borderBottom?: { size: number; color: string };
      keepNext?: boolean;
    } = {},
  ) =>
    new Paragraph({
      bidirectional: rtl,
      alignment: extra.alignment ?? align,
      spacing: { before: extra.before ?? 0, after: extra.after ?? 60 },
      keepLines: true,
      keepNext: extra.keepNext,
      border: extra.borderBottom
        ? {
            bottom: {
              style: BorderStyle.SINGLE,
              size: extra.borderBottom.size,
              color: extra.borderBottom.color,
              space: 1,
            },
          }
        : undefined,
      children,
    });

  const textParagraph = (
    text: string,
    opts: RunOpts & {
      before?: number;
      after?: number;
      keepNext?: boolean;
      borderBottom?: { size: number; color: string };
    } = {},
  ) => paragraph([run(text, opts)], opts);

  const cell = (
    children: Paragraph[],
    width: number,
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
  ) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: NO_BORDERS,
      margins: { top: 0, bottom: 0, left: 40, right: 40 },
      children: children.length
        ? children
        : [paragraph([], { after: 0, alignment })],
    });

  const pairTable = (left: Paragraph[], right: Paragraph[], leftWidth = TITLE_WIDTH) =>
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [leftWidth, CONTENT_WIDTH - leftWidth],
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: rtl,
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [cell(left, leftWidth), cell(right, CONTENT_WIDTH - leftWidth)],
        }),
      ],
    });

  const headingRow = (title: string, dates: string) =>
    pairTable(
      [
        paragraph(title ? [run(title, { bold: true })] : [], {
          after: 0,
        }),
      ],
      [
        paragraph(dates ? [run(dates, { color: "3F3A34" })] : [], {
          after: 0,
          alignment: rtl ? AlignmentType.LEFT : AlignmentType.RIGHT,
        }),
      ],
    );

  const blocks: (Paragraph | Table)[] = [];

  if (view.name) {
    blocks.push(
      paragraph([run(view.name, { bold: true, size: 40 })], {
        after: 80,
        borderBottom: { size: 16, color: "1C1915" },
      }),
    );
  }

  for (let index = 0; index < view.contacts.length; index += 2) {
    const first = view.contacts[index];
    const second = view.contacts[index + 1];
    blocks.push(
      pairTable(
        [contactParagraph(first, run, paragraph)],
        second ? [contactParagraph(second, run, paragraph)] : [paragraph([], { after: 0 })],
        CONTENT_WIDTH / 2,
      ),
    );
  }

  if (view.summary) {
    blocks.push(sectionTitle(view.summary.title, textParagraph));
    for (const lineText of view.summary.text.split(/\n+/)) {
      const trimmed = lineText.trim();
      if (trimmed) blocks.push(textParagraph(trimmed, { after: 40 }));
    }
  }

  const addItems = (title: string, items: CvItem[]) => {
    blocks.push(sectionTitle(title, textParagraph));
    items.forEach((item, itemIndex) => {
      blocks.push(headingRow(item.heading, item.dates));
      if (item.meta) blocks.push(textParagraph(item.meta, { color: "3F3A34", after: 40 }));
      item.lines.forEach((line, lineIndex) => {
        const last = itemIndex === items.length - 1 && lineIndex === item.lines.length - 1;
        blocks.push(labeledLine(line, run, paragraph, last ? 160 : 40));
      });
      if (item.lines.length === 0) {
        const last = itemIndex === items.length - 1;
        blocks.push(paragraph([], { after: last ? 80 : 140 }));
      }
    });
  };

  if (view.jobs) addItems(view.jobs.title, view.jobs.items);
  if (view.education) addItems(view.education.title, view.education.items);
  if (view.military) addItems(view.military.title, view.military.items);

  if (view.skills) {
    blocks.push(sectionTitle(view.skills.title, textParagraph));
    blocks.push(textParagraph(view.skills.items.map((skill) => `V  ${skill}`).join("     "), { after: 80 }));
  }

  if (view.languages) {
    blocks.push(sectionTitle(view.languages.title, textParagraph));
    blocks.push(
      textParagraph(
        view.languages.items.map((item) => `${item.name} — ${item.level}`).join("     "),
        { after: 80 },
      ),
    );
  }

  const document = new Document({
    title: view.name || (rtl ? "קורות חיים" : "Resume"),
    creator: rtl ? "קורות" : "Korot",
    description: rtl ? "קורות חיים" : "Resume",
    styles: {
      default: {
        document: {
          paragraph: { alignment: align },
          run: {
            font,
            size: 22,
            sizeComplexScript: 22,
            rightToLeft: rtl,
            language: { value: lang, bidirectional: lang },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH, height: 16838 },
            margin: { top: 907, bottom: 1020, left: MARGIN, right: MARGIN },
          },
        },
        children: blocks,
      },
    ],
  });

  return Packer.toBuffer(document);
}

function sectionTitle(
  title: string,
  textParagraph: (
    text: string,
    opts?: {
      before?: number;
      after?: number;
      bold?: boolean;
      size?: number;
      keepNext?: boolean;
      borderBottom?: { size: number; color: string };
    },
  ) => Paragraph,
): Paragraph {
  return textParagraph(title, {
    bold: true,
    size: 24,
    before: 280,
    after: 80,
    keepNext: true,
    borderBottom: { size: 8, color: "CFC6B8" },
  });
}

function labeledLine(
  line: CvLine,
  run: (text: string, opts?: RunOpts) => TextRun,
  paragraph: (
    children: (TextRun | ExternalHyperlink)[],
    extra?: { after?: number },
  ) => Paragraph,
  after: number,
): Paragraph {
  const children: TextRun[] = [];
  if (line.label) children.push(run(`${line.label}. `, { bold: true }));
  const parts = line.text.split(/\n+/);
  parts.forEach((part, index) => {
    if (index > 0) children.push(run(" "));
    children.push(run(part.trim()));
  });
  return paragraph(children, { after });
}

function contactParagraph(
  contact: { label: string; value: string; href?: string },
  run: (text: string, opts?: RunOpts) => TextRun,
  paragraph: (
    children: (TextRun | ExternalHyperlink)[],
    extra?: { after?: number },
  ) => Paragraph,
): Paragraph {
  const label = run(`${contact.label}  `, { color: "6B645C" });
  if (!contact.href) return paragraph([label, run(contact.value)], { after: 40 });
  return paragraph(
    [
      label,
      new ExternalHyperlink({
        link: contact.href,
        children: [run(contact.value, { underline: true })],
      }),
    ],
    { after: 40 },
  );
}
