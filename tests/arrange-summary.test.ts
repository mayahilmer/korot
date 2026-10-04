import assert from "node:assert/strict";
import test from "node:test";
import { arrangeSummary, summaryLineCount } from "../lib/arrange-summary.ts";

test("keeps three finished sentences on three lines", () => {
  const input = "מנהלת תפעול עם ניסיון בצוותים. צמצמתי זמני אספקה. אני עובדת מול ספקים.";
  const output = arrangeSummary(input);
  assert.equal(summaryLineCount(output), 3);
  assert.match(output, /מנהלת תפעול/);
  assert.match(output, /ספקים/);
});

test("turns extra bullets into four lines without new facts", () => {
  const input = ["אחת", "שתיים", "שלוש", "ארבע", "חמש"].join("\n");
  const output = arrangeSummary(input);
  assert.equal(summaryLineCount(output), 4);
  assert.match(output, /ארבע; חמש/);
  assert.doesNotMatch(output, /מנהל/);
});

test("returns an empty string for blank notes", () => {
  assert.equal(arrangeSummary("  \n  "), "");
});

test("drops filler and a repeated sentence but keeps the number", () => {
  const input = [
    "אני בעצם מנהלת תפעול עם ניסיון מאוד רחב.",
    "אני בעצם מנהלת תפעול עם ניסיון מאוד רחב.",
    "צמצמתי זמני אספקה ב־30%.",
  ].join(" ");
  const output = arrangeSummary(input);
  assert.equal(summaryLineCount(output), 2);
  assert.match(output, /30%/);
  assert.doesNotMatch(output, /בעצם|מאוד/);
  assert.equal(output.split("מנהלת תפעול").length - 1, 1);
  assert.doesNotMatch(output, /manager|team lead/i);
});
