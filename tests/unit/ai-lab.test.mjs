import test from "node:test";
import assert from "node:assert/strict";
import { scoreBrief, scoreVerification, composePrompt } from "../../site/app/labs/ai-lab.js";

test("AI workbench scoring rewards complete, checkable briefs and penalises confidential data", () => {
  const empty = scoreBrief({});
  assert.equal(empty.score, 0);
  const vague = scoreBrief({ role: "Please help me with my work today", goal: "Make a summary of the data", context: "Some orders from a shop", constraints: "Be concise and helpful", format: "Whatever is best", acceptance: "Looks good to me" });
  const strong = scoreBrief({ role: "You are an operations analyst for a small retailer.", goal: "Summarise sales by region so the owner can decide where to add stock.", context: "8 orders: North 6,600 across 4 orders, South 4,500 across 4 orders, INR excluding tax.", constraints: "Use only the data given; say unknown when a figure is missing; do not convert currency.", format: "A table with Region, Orders, Sales (INR) and a paragraph of three sentences.", acceptance: "Totals must match my SUM; every claim must cite a row; no figure may be invented." });
  assert.ok(strong.score > vague.score && strong.score >= 36, `strong ${strong.score} vs vague ${vague.score}`);
  assert.equal(strong.privacyOk, true);
  const leaky = scoreBrief({ ...{ role: "You are an analyst.", goal: "so the owner can decide", context: "Salary of Priya is 40000 and her Aadhaar number", constraints: "only this", format: "table", acceptance: "must match" } });
  assert.equal(leaky.privacyOk, false);
  assert.ok(leaky.score < scoreBrief({ role: "You are an analyst.", goal: "so the owner can decide", context: "8 orders 11,100", constraints: "only this", format: "table", acceptance: "must match" }).score);
  assert.match(composePrompt({ role: "You are an analyst." }), /^Role for the assistant: You are an analyst\./);
});

test("verification scoring requires a decision on every numeric line, at least one flag and a written check", () => {
  const lines = ["North sales were 6,600 across four orders.", "South sales were 4,900 across four orders.", "The owner should add stock in the North."];
  assert.equal(scoreVerification(lines, {}, "").score, 0);
  const partial = scoreVerification(lines, { 0: "supported" }, "");
  assert.ok(partial.score > 0 && partial.numericDecided === false);
  const full = scoreVerification(lines, { 0: "supported", 1: "unsupported", 2: "evidence" }, "Recalculated both regional totals with SUM against the eight rows; South is 4,500 not 4,900, so line 2 is unsupported.");
  assert.equal(full.score, 40);
  assert.equal(full.flaggedAny, true);
  assert.equal(full.noteOk, true);
  const uncritical = scoreVerification(lines, { 0: "supported", 1: "supported", 2: "supported" }, "All fine.");
  assert.ok(uncritical.score < full.score, "marking everything supported without a check earns less");
});
