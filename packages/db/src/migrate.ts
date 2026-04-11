/**
 * Migration runner
 * Reads all .sql files from migrations/ in order and executes them
 * via the Supabase service role key (no pg dependency required).
 *
 * Run: pnpm --filter @uxbridge/db migrate
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

const supabaseUrl = process.env["SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

async function execSQL(sql: string, file: string): Promise<void> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey!,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    // If exec_sql RPC doesn't exist, fall through to direct DB URL approach
    const text = await response.text();
    if (text.includes("exec_sql") && text.includes("not found")) {
      throw new Error(
        `exec_sql RPC not found. Use the Supabase dashboard SQL editor to run ${file} manually, or use: psql $SUPABASE_DB_URL -f packages/db/src/migrations/${file}`,
      );
    }
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
}

async function runMigrations() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Running ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`  → ${file}`);
    await execSQL(sql, file);
  }

  console.log("✅ Migrations complete");
}

runMigrations().catch((err: Error) => {
  console.error("Migration failed:", err.message);
  console.error("\nAlternative: run migrations manually via Supabase dashboard SQL editor");
  console.error("or: psql $SUPABASE_DB_URL -f packages/db/src/migrations/<file>.sql");
  process.exit(1);
});
