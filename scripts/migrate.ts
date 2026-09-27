import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { getDb } from "../lib/db.ts";

const MIGRATIONS_DIR = path.join(import.meta.dirname, "..", "db", "migrations");

async function main() {
  const db = await getDb();

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name        TEXT PRIMARY KEY,
        applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    const result = await db.execute("SELECT name FROM _migrations");
    const appliedNames = new Set(result.rows.map((row) => String(row.name)));

    const pendingFiles = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .filter((file) => !appliedNames.has(file));

    if (pendingFiles.length === 0) {
      console.log("নতুন কোনো migration নেই — ডাটাবেস আপ-টু-ডেট।");
      return;
    }

    for (const file of pendingFiles) {
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      // পুরো ফাইল আর _migrations-এর সারি একসাথে সফল হবে, নয়তো কিছুই না
      const tx = await db.transaction("write");
      try {
        await tx.executeMultiple(sql);
        await tx.execute({
          sql: "INSERT INTO _migrations (name) VALUES (?)",
          args: [file],
        });
        await tx.commit();
      } catch (error) {
        await tx.rollback();
        throw new Error(`${file} চালাতে ব্যর্থ: ${(error as Error).message}`);
      } finally {
        tx.close();
      }

      console.log(`✓ ${file}`);
    }

    console.log(`${pendingFiles.length}টা migration সফলভাবে চলেছে।`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
