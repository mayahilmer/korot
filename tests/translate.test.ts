import assert from "node:assert/strict";
import test from "node:test";
import { applyGlossary, polishTranslation, translatePlain } from "../lib/machine-translate.ts";
import { sampleCv } from "../lib/model.ts";
import { switchLanguage } from "../lib/switch-language.ts";

test("glossary keeps a military role in professional English", async () => {
  const output = await translatePlain("משקית שלישות", "en", async () => {
    throw new Error("the glossary should not call the translator");
  });
  assert.equal(output, "Personnel NCO");
});

test("polishes a rough translation without adding facts", async () => {
  const output = await translatePlain("קיצרתי מ־48 ל־30.", "en", async () => "I shortened from48 to30.");
  assert.equal(output, "Shortened from 48 to 30.");
  assert.equal(applyGlossary("תל אביב", "en"), "Tel Aviv");
  assert.equal(polishTranslation("hours. cut delivery.", "en"), "Hours. Cut delivery.");
});

test("switching back to Hebrew restores the original wording", async () => {
  let calls = 0;
  const translate = async (texts: string[]) => {
    calls += 1;
    return texts.map((text) => (text.trim() ? `EN ${text}` : text));
  };
  const hebrew = sampleCv("he");
  const english = await switchLanguage(hebrew, "en", translate);
  assert.equal(calls, 1);
  assert.match(english.personal.fullName, /^EN /);
  assert.equal(english.lang, "en");
  assert.equal(english.skills.find((skill) => skill.name === "Office")?.name, "Office");

  const restored = await switchLanguage(english, "he", translate);
  assert.equal(calls, 1);
  assert.equal(restored.personal.fullName, "נועה ברק");
  assert.match(restored.summary, /מנהלת תפעול/);

  const again = await switchLanguage(restored, "en", translate);
  assert.equal(calls, 1);
  assert.equal(again.personal.fullName, english.personal.fullName);
});
