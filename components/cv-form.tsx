"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { arrangeSummary, summaryLineCount } from "@/lib/arrange-summary";
import type { Copy } from "@/lib/copy";
import { digitsOnly, monthNames, rangeIsBackwards } from "@/lib/dates";
import {
  blankEducation,
  blankJob,
  blankLanguage,
  blankMilitary,
  createId,
  hasAcademicEducation,
} from "@/lib/model";
import { emailLooksOff } from "@/lib/text";
import type {
  CvData,
  EducationKind,
  Lang,
  LanguageLevel,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

const levels: LanguageLevel[] = ["native", "fluent", "advanced", "intermediate", "basic"];
const kinds: EducationKind[] = ["academic", "certificate", "highschool"];

type Update = (recipe: (cv: CvData) => CvData) => void;

export function CvForm({
  cv,
  copy,
  update,
  translating,
  onLanguage,
}: {
  cv: CvData;
  copy: Copy;
  update: Update;
  translating: boolean;
  onLanguage: (lang: Lang) => void;
}) {
  return (
    <div className="grid gap-4">
      <Section index={1} title={copy.document} hint={copy.documentHint}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Segmented
            label={copy.fileType}
            value={cv.format}
            options={[
              { value: "pdf", label: "PDF" },
              { value: "docx", label: "Word" },
            ]}
            onChange={(format) => update((current) => ({ ...current, format }))}
          />
          <Segmented
            label={copy.language}
            value={cv.lang}
            disabled={translating}
            options={[
              { value: "he", label: "עברית" },
              { value: "en", label: "English" },
            ]}
            onChange={(lang) => {
              if (lang !== cv.lang) onLanguage(lang);
            }}
          />
          <Segmented
            label={copy.font}
            value={cv.font}
            options={[
              { value: "david", label: "David" },
              { value: "arial", label: "Arial" },
            ]}
            onChange={(font) => update((current) => ({ ...current, font }))}
          />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{copy.fontHint}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {translating ? copy.translating : copy.languageHint}
        </p>
      </Section>

      <Section index={2} title={copy.personal} hint={copy.personalHint}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={copy.fullName} className="sm:col-span-2">
            <Input
              id="full-name"
              value={cv.personal.fullName}
              autoComplete="name"
              onChange={(event) => patchPersonal(update, { fullName: event.target.value })}
            />
          </Field>
          <Field label={copy.idNumber} hint={copy.idHint}>
            <Input
              value={cv.personal.idNumber}
              inputMode="numeric"
              maxLength={9}
              onChange={(event) =>
                patchPersonal(update, { idNumber: digitsOnly(event.target.value, 9) })
              }
            />
          </Field>
          <Field label={copy.phone}>
            <Input
              type="tel"
              autoComplete="tel"
              value={cv.personal.phone}
              onChange={(event) => patchPersonal(update, { phone: event.target.value })}
            />
          </Field>
          <Field label={copy.email} hint={emailLooksOff(cv.personal.email) ? copy.emailHint : undefined}>
            <Input
              type="email"
              autoComplete="email"
              aria-invalid={emailLooksOff(cv.personal.email)}
              value={cv.personal.email}
              onChange={(event) => patchPersonal(update, { email: event.target.value })}
            />
          </Field>
          <Field label={copy.city}>
            <Input
              autoComplete="address-level2"
              value={cv.personal.city}
              onChange={(event) => patchPersonal(update, { city: event.target.value })}
            />
          </Field>
          <Field label={copy.linkedin}>
            <Input
              value={cv.personal.linkedin}
              placeholder="linkedin.com/in/name"
              onChange={(event) => patchPersonal(update, { linkedin: event.target.value })}
            />
          </Field>
          <Field label={copy.portfolio}>
            <Input
              value={cv.personal.portfolio}
              placeholder="example.com"
              onChange={(event) => patchPersonal(update, { portfolio: event.target.value })}
            />
          </Field>
        </div>
      </Section>

      <SummarySection cv={cv} copy={copy} update={update} />

      <Section
        index={4}
        title={copy.jobs}
        hint={copy.jobsHint}
        action={
          <Button type="button" variant="outline" onClick={() => update((current) => ({ ...current, jobs: [blankJob(), ...current.jobs] }))}>
            {copy.addJob}
          </Button>
        }
      >
        {cv.jobs.length === 0 ? <p className="text-sm text-muted-foreground">{copy.jobsEmpty}</p> : null}
        {cv.jobs.map((job, index) => (
          <Entry
            key={job.id}
            title={job.title.trim() || job.company.trim() || `${copy.jobFallback} ${index + 1}`}
            removeLabel={copy.remove}
            warning={
              rangeIsBackwards(job.fromMonth, job.fromYear, job.toMonth, job.toYear, job.current)
                ? copy.dateOrder
                : undefined
            }
            onRemove={() =>
              update((current) => ({ ...current, jobs: current.jobs.filter((item) => item.id !== job.id) }))
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={copy.role}>
                <Input
                  value={job.title}
                  onChange={(event) => patchJob(update, job.id, { title: event.target.value })}
                />
              </Field>
              <Field label={copy.company}>
                <Input
                  value={job.company}
                  onChange={(event) => patchJob(update, job.id, { company: event.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DateSpan
                label={copy.from}
                monthLabel={copy.month}
                yearLabel={copy.year}
                lang={cv.lang}
                month={job.fromMonth}
                year={job.fromYear}
                onMonth={(fromMonth) => patchJob(update, job.id, { fromMonth })}
                onYear={(fromYear) => patchJob(update, job.id, { fromYear })}
              />
              <DateSpan
                label={copy.to}
                monthLabel={copy.month}
                yearLabel={copy.year}
                lang={cv.lang}
                month={job.toMonth}
                year={job.toYear}
                disabled={job.current}
                onMonth={(toMonth) => patchJob(update, job.id, { toMonth })}
                onYear={(toYear) => patchJob(update, job.id, { toYear })}
              />
            </div>
            <CheckRow
              id={`${job.id}-current`}
              checked={job.current}
              label={copy.currentJob}
              onChange={(current) => patchJob(update, job.id, { current })}
            />
            <Field label={copy.details}>
              <Textarea
                value={job.details}
                placeholder={copy.detailsPlaceholder}
                onChange={(event) => patchJob(update, job.id, { details: event.target.value })}
              />
            </Field>
            <Field label={copy.responsibilities}>
              <Textarea
                value={job.responsibilities}
                placeholder={copy.responsibilitiesPlaceholder}
                onChange={(event) => patchJob(update, job.id, { responsibilities: event.target.value })}
              />
            </Field>
            <Field label={copy.achievements}>
              <Textarea
                value={job.achievements}
                placeholder={copy.achievementsPlaceholder}
                onChange={(event) => patchJob(update, job.id, { achievements: event.target.value })}
              />
            </Field>
          </Entry>
        ))}
      </Section>

      <Section
        index={5}
        title={copy.education}
        hint={copy.educationHint}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => update((current) => ({ ...current, education: [blankEducation(), ...current.education] }))}
          >
            {copy.addEducation}
          </Button>
        }
      >
        {cv.education.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.educationEmpty}</p>
        ) : null}
        {cv.education.map((item, index) => {
          const hidden = item.kind === "highschool" && hasAcademicEducation(cv.education);
          return (
            <Entry
              key={item.id}
              title={item.credential.trim() || item.institution.trim() || `${copy.educationFallback} ${index + 1}`}
              removeLabel={copy.remove}
              warning={
                hidden
                  ? copy.hiddenSchool
                  : rangeIsBackwards("", item.fromYear, "", item.toYear, item.current)
                    ? copy.dateOrder
                    : undefined
              }
              onRemove={() =>
                update((current) => ({
                  ...current,
                  education: current.education.filter((entry) => entry.id !== item.id),
                }))
              }
            >
              <Field label={copy.kind}>
                <select
                  className={selectClass}
                  value={item.kind}
                  onChange={(event) =>
                    patchEducation(update, item.id, { kind: event.target.value as EducationKind })
                  }
                >
                  {kinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {copy.kinds[kind]}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={item.kind === "highschool" ? copy.school : copy.institution}>
                  <Input
                    value={item.institution}
                    onChange={(event) => patchEducation(update, item.id, { institution: event.target.value })}
                  />
                </Field>
                <Field label={copy.credential}>
                  <Input
                    value={item.credential}
                    placeholder={
                      item.kind === "academic"
                        ? copy.credentialAcademic
                        : item.kind === "highschool"
                          ? copy.credentialSchool
                          : copy.credentialCertificate
                    }
                    onChange={(event) => patchEducation(update, item.id, { credential: event.target.value })}
                  />
                </Field>
                <Field label={copy.from}>
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={copy.year}
                    value={item.fromYear}
                    onChange={(event) =>
                      patchEducation(update, item.id, { fromYear: digitsOnly(event.target.value, 4) })
                    }
                  />
                </Field>
                <Field label={copy.to}>
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={copy.year}
                    disabled={item.current}
                    value={item.toYear}
                    onChange={(event) =>
                      patchEducation(update, item.id, { toYear: digitsOnly(event.target.value, 4) })
                    }
                  />
                </Field>
              </div>
              <CheckRow
                id={`${item.id}-current`}
                checked={item.current}
                label={copy.currentStudy}
                onChange={(current) => patchEducation(update, item.id, { current })}
              />
              {item.kind === "highschool" ? (
                <>
                  <CheckRow
                    id={`${item.id}-bagrut`}
                    checked={item.fullBagrut}
                    label={copy.fullBagrut}
                    onChange={(fullBagrut) => patchEducation(update, item.id, { fullBagrut })}
                  />
                  <Field label={copy.expanded}>
                    <Input
                      value={item.expandedSubjects}
                      placeholder={copy.expandedPlaceholder}
                      onChange={(event) =>
                        patchEducation(update, item.id, { expandedSubjects: event.target.value })
                      }
                    />
                  </Field>
                </>
              ) : (
                <CheckRow
                  id={`${item.id}-honors`}
                  checked={item.honors}
                  label={copy.honors}
                  onChange={(honors) => patchEducation(update, item.id, { honors })}
                />
              )}
            </Entry>
          );
        })}
      </Section>

      <Section
        index={6}
        title={copy.military}
        hint={copy.militaryHint}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => update((current) => ({ ...current, military: [blankMilitary(), ...current.military] }))}
          >
            {copy.addMilitary}
          </Button>
        }
      >
        {cv.military.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.militaryEmpty}</p>
        ) : null}
        {cv.military.map((item, index) => (
          <Entry
            key={item.id}
            title={item.role.trim() || item.base.trim() || `${copy.militaryFallback} ${index + 1}`}
            removeLabel={copy.remove}
            warning={
              rangeIsBackwards("", item.fromYear, "", item.toYear, item.current) ? copy.dateOrder : undefined
            }
            onRemove={() =>
              update((current) => ({
                ...current,
                military: current.military.filter((entry) => entry.id !== item.id),
              }))
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Segmented
                  label={copy.serviceKind}
                  value={item.kind}
                  options={[
                    { value: "military", label: copy.serviceMilitary },
                    { value: "national", label: copy.serviceNational },
                  ]}
                  onChange={(kind) => patchMilitary(update, item.id, { kind })}
                />
              </div>
              <Field label={copy.militaryRole}>
                <Input
                  value={item.role}
                  onChange={(event) => patchMilitary(update, item.id, { role: event.target.value })}
                />
              </Field>
              <Field label={item.kind === "national" ? copy.placement : copy.base}>
                <Input
                  value={item.base}
                  onChange={(event) => patchMilitary(update, item.id, { base: event.target.value })}
                />
              </Field>
              <Field label={copy.from}>
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={copy.year}
                  value={item.fromYear}
                  onChange={(event) =>
                    patchMilitary(update, item.id, { fromYear: digitsOnly(event.target.value, 4) })
                  }
                />
              </Field>
              <Field label={copy.to}>
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={copy.year}
                  disabled={item.current}
                  value={item.toYear}
                  onChange={(event) =>
                    patchMilitary(update, item.id, { toYear: digitsOnly(event.target.value, 4) })
                  }
                />
              </Field>
            </div>
            <CheckRow
              id={`${item.id}-current`}
              checked={item.current}
              label={copy.currentService}
              onChange={(current) => patchMilitary(update, item.id, { current })}
            />
          </Entry>
        ))}
      </Section>

      <SkillsSection cv={cv} copy={copy} update={update} />
      <LanguagesSection cv={cv} copy={copy} update={update} />
      <p className="px-1 text-sm leading-6 text-muted-foreground">{copy.localNote}</p>
    </div>
  );
}

function SummarySection({ cv, copy, update }: { cv: CvData; copy: Copy; update: Update }) {
  const [undo, setUndo] = useState<string | null>(null);
  const [note, setNote] = useState("");
  return (
    <Section index={3} title={copy.summary} hint={copy.summaryHint}>
      <Textarea
        value={cv.summary}
        rows={5}
        placeholder={copy.summaryPlaceholder}
        onChange={(event) => {
          setUndo(null);
          setNote("");
          update((current) => ({ ...current, summary: event.target.value }));
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!cv.summary.trim()}
          onClick={() => {
            const next = arrangeSummary(cv.summary);
            if (!next || next === cv.summary.trim() || next === cv.summary) {
              setNote(copy.alreadyArranged);
              return;
            }
            setUndo(cv.summary);
            const count = summaryLineCount(next);
            setNote(count < 3 ? `${copy.arranged(count)} ${copy.addAnotherLine}` : copy.arranged(count));
            update((current) => ({ ...current, summary: next }));
          }}
        >
          {copy.arrange}
        </Button>
        {undo !== null ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const previous = undo;
              setUndo(null);
              setNote("");
              update((current) => ({ ...current, summary: previous }));
            }}
          >
            {copy.undo}
          </Button>
        ) : null}
      </div>
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </Section>
  );
}

function SkillsSection({ cv, copy, update }: { cv: CvData; copy: Copy; update: Update }) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const name = draft.trim();
    if (!name) return;
    update((current) => {
      const existing = current.skills.find((skill) => skill.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return {
          ...current,
          skills: current.skills.map((skill) =>
            skill.id === existing.id ? { ...skill, selected: true } : skill,
          ),
        };
      }
      return {
        ...current,
        skills: [...current.skills, { id: createId(), name, selected: true, custom: true }],
      };
    });
    setDraft("");
  }

  return (
    <Section index={7} title={copy.skills} hint={copy.skillsHint}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cv.skills.map((skill) => (
          <div
            key={skill.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
              skill.selected ? "border-foreground bg-foreground/5" : "border-border",
            )}
          >
            <Checkbox
              id={skill.id}
              checked={skill.selected}
              onCheckedChange={(checked) =>
                update((current) => ({
                  ...current,
                  skills: current.skills.map((item) =>
                    item.id === skill.id ? { ...item, selected: checked === true } : item,
                  ),
                }))
              }
            />
            <Label htmlFor={skill.id} className="min-w-0 flex-1 font-normal">
              <span className="truncate">{skill.name}</span>
            </Label>
            {skill.custom ? (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() =>
                  update((current) => ({
                    ...current,
                    skills: current.skills.filter((item) => item.id !== skill.id),
                  }))
                }
              >
                {copy.remove}
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={copy.skillPlaceholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addSkill}>
          {copy.addSkill}
        </Button>
      </div>
    </Section>
  );
}

function LanguagesSection({ cv, copy, update }: { cv: CvData; copy: Copy; update: Update }) {
  const existing = new Set(cv.languages.map((item) => item.name.trim().toLowerCase()));
  const suggestions = copy.suggestions.filter((name) => !existing.has(name.toLowerCase()));

  return (
    <Section
      index={8}
      title={copy.languages}
      hint={copy.languagesHint}
      action={
        <Button
          type="button"
          variant="outline"
          onClick={() => update((current) => ({ ...current, languages: [...current.languages, blankLanguage()] }))}
        >
          {copy.addLanguage}
        </Button>
      }
    >
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((name) => (
            <Button
              key={name}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                update((current) => ({
                  ...current,
                  languages: [
                    ...current.languages,
                    blankLanguage(name, name === "עברית" || name === "Hebrew" ? "native" : "advanced"),
                  ],
                }))
              }
            >
              {name}
            </Button>
          ))}
        </div>
      ) : null}
      {cv.languages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.languagesEmpty}</p>
      ) : null}
      {cv.languages.map((item) => (
        <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <Field label={copy.languageName}>
            <Input
              value={item.name}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  languages: current.languages.map((entry) =>
                    entry.id === item.id ? { ...entry, name: event.target.value } : entry,
                  ),
                }))
              }
            />
          </Field>
          <Field label={copy.level}>
            <select
              className={selectClass}
              value={item.level}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  languages: current.languages.map((entry) =>
                    entry.id === item.id
                      ? { ...entry, level: event.target.value as LanguageLevel }
                      : entry,
                  ),
                }))
              }
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {copy.levels[level]}
                </option>
              ))}
            </select>
          </Field>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              update((current) => ({
                ...current,
                languages: current.languages.filter((entry) => entry.id !== item.id),
              }))
            }
          >
            {copy.remove}
          </Button>
        </div>
      ))}
    </Section>
  );
}

function patchPersonal(update: Update, patch: Partial<CvData["personal"]>) {
  update((current) => ({ ...current, personal: { ...current.personal, ...patch } }));
}

function patchJob(update: Update, id: string, patch: Partial<CvData["jobs"][number]>) {
  update((current) => ({
    ...current,
    jobs: current.jobs.map((job) => (job.id === id ? { ...job, ...patch } : job)),
  }));
}

function patchEducation(update: Update, id: string, patch: Partial<CvData["education"][number]>) {
  update((current) => ({
    ...current,
    education: current.education.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  }));
}

function patchMilitary(update: Update, id: string, patch: Partial<CvData["military"][number]>) {
  update((current) => ({
    ...current,
    military: current.military.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  }));
}

function Section({
  index,
  title,
  hint,
  action,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background">
              {index}
            </span>
            {title}
          </h2>
          {hint ? <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{hint}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Entry({
  title,
  onRemove,
  removeLabel,
  warning,
  children,
}: {
  title: string;
  onRemove: () => void;
  removeLabel: string;
  warning?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium">{title}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          {removeLabel}
        </Button>
      </div>
      {warning ? <p className="text-sm text-destructive">{warning}</p> : null}
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="flex rounded-lg border border-border bg-muted p-0.5" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-8 flex-1 rounded-md px-2 text-sm transition-colors",
                selected ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateSpan({
  label,
  monthLabel,
  yearLabel,
  lang,
  month,
  year,
  disabled,
  onMonth,
  onYear,
}: {
  label: string;
  monthLabel: string;
  yearLabel: string;
  lang: CvData["lang"];
  month: string;
  year: string;
  disabled?: boolean;
  onMonth: (value: string) => void;
  onYear: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="grid grid-cols-2 gap-2">
        <select
          aria-label={monthLabel}
          className={selectClass}
          value={month}
          disabled={disabled}
          onChange={(event) => onMonth(event.target.value)}
        >
          <option value="">{monthLabel}</option>
          {monthNames(lang).map((name, index) => (
            <option key={name} value={String(index + 1)}>
              {name}
            </option>
          ))}
        </select>
        <Input
          aria-label={yearLabel}
          inputMode="numeric"
          maxLength={4}
          placeholder={yearLabel}
          disabled={disabled}
          value={year}
          onChange={(event) => onYear(digitsOnly(event.target.value, 4))}
        />
      </div>
    </Field>
  );
}

function CheckRow({
  id,
  checked,
  label,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
