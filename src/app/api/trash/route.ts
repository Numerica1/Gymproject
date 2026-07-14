import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getSupabaseHeaders(extra?: HeadersInit): HeadersInit {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.");
  }
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: getSupabaseHeaders(init.headers),
    cache: "no-store",
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : text || response.statusText;
    throw new Error(detail);
  }
  return payload;
}

// Module -> Supabase table + the column that holds the human-friendly name.
const TRASH_MODULES: { module: string; table: string; nameColumn: string }[] = [
  { module: "Products", table: "products", nameColumn: "name" },
  { module: "Brands", table: "brands", nameColumn: "name" },
  { module: "Categories", table: "shop_categories", nameColumn: "label" },
  { module: "Programs", table: "classes", nameColumn: "title" },
  { module: "Trainers", table: "trainers", nameColumn: "name" },
  { module: "Memberships", table: "memberships", nameColumn: "name" },
  { module: "Reviews", table: "reviews", nameColumn: "customer_name" },
  { module: "Offers", table: "offers", nameColumn: "title" },
  { module: "Blogs", table: "blogs", nameColumn: "title" },
];

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Supabase not configured — there is nothing to list.
      return NextResponse.json({ counts: {}, items: [] });
    }

    const items: Array<{
      module: string;
      table: string;
      id: string;
      name: string;
      deletedAt: string | null;
      deletedBy: string | null;
      payload: unknown;
    }> = [];
    const counts: Record<string, number> = {};

    await Promise.all(
      TRASH_MODULES.map(async ({ module, table, nameColumn }) => {
        const rows = (await supabaseRequest(
          `${table}?select=id,${nameColumn},deleted_at,deleted_by,source_payload&is_deleted=eq.true&order=deleted_at.desc.nullsfirst`
        )) as Array<Record<string, unknown>>;

        counts[module] = rows.length;
        for (const row of rows) {
          items.push({
            module,
            table,
            id: String(row.id),
            name: String(row[nameColumn] ?? "Untitled"),
            deletedAt: row.deleted_at ? String(row.deleted_at) : null,
            deletedBy: row.deleted_by ? String(row.deleted_by) : null,
            payload: row.source_payload ?? null,
          });
        }
      })
    );

    return NextResponse.json({ counts, items });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load trash.", 500);
  }
}
