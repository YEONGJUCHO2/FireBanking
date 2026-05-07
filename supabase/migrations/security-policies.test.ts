import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = join(process.cwd(), "supabase", "migrations");

function readMigrations() {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
    .join("\n");
}

describe("Supabase security migrations", () => {
  it("closes broad admin self-insert policies on couples and couple_members", () => {
    const sql = readMigrations();

    expect(sql).toContain('drop policy if exists "authenticated users can create couples"');
    expect(sql).toContain('drop policy if exists "authenticated users can create own admin membership"');
    expect(sql).toContain("public.couples.created_by = auth.uid()");
    expect(sql).toContain("couple_members.couple_id");
  });
});
