import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileStorage } from "../../server/storage.mjs";

test("file storage writes atomically and loads what it wrote", () => {
  const dir = mkdtempSync(join(tmpdir(), "rolevia-file-"));
  const path = join(dir, "nested", "state.json");
  const storage = fileStorage(path);
  assert.equal(storage.get(), null);
  storage.set({ version: 6, rev: 1, users: [] });
  storage.set({ version: 6, rev: 2, users: [{ id: "u1" }] });
  assert.deepEqual(JSON.parse(readFileSync(path, "utf8")).rev, 2);
  assert.deepEqual(readdirSync(join(dir, "nested")), ["state.json"], "no temporary file is left behind");
  assert.equal(fileStorage(path).revision(), 2);
});

test("file storage refuses to start on a corrupt state file instead of re-seeding over it", () => {
  const dir = mkdtempSync(join(tmpdir(), "rolevia-file-"));
  const path = join(dir, "state.json");
  writeFileSync(path, '{"version":6,"rev":7,"users":[{"id":"u1"');
  assert.throws(() => fileStorage(path), /not valid JSON/);
  const files = readdirSync(dir);
  assert.ok(files.includes("state.json"), "the original file is untouched");
  assert.ok(files.some(name => /^state\.json\.corrupt-\d+\.bak$/.test(name)), "a backup copy is kept next to it");
});
