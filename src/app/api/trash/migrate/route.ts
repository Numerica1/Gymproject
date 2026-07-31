import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function getHeaders(): HeadersInit {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase not configured.");
  }
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function runSql(sql: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    // Try alternative via pg REST direct ALTER - use individual ALTER statements
    return null;
  }
  return response.json();
}



export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 500 });
    }

    // Tables that need soft-delete columns
    const tables = [
      "clients",
      "products",
      "brands",
      "shop_categories",
      "trainers",
      "classes",
      "memberships",
      "reviews",
      "offers",
      "blogs",
    ];

    // Run migration SQL directly via Supabase REST API (PostgreSQL function)
    // Since exec_sql may not exist, we use a batch ALTER approach
    const migrationSql = tables
      .map(
        (table) => `
ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS deleted_by TEXT;
CREATE INDEX IF NOT EXISTS idx_${table}_is_deleted ON public.${table} (is_deleted);
`
      )
      .join("\n");

    // Return migration SQL for the user to run manually + attempt auto-run
    await runSql(migrationSql).catch(() => null);

    return NextResponse.json({
      success: true,
      message: "Migration SQL generated. Run the sql field in your Supabase SQL Editor if auto-migration failed.",
      tables,
      sql: migrationSql,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed." },
      { status: 500 }
    );
  }
}
