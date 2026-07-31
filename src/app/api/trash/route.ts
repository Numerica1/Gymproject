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
    "Prefer": "return=representation",
  };
}

interface TrashModule {
  tableName: string;
  module: string;
  nameColumn: string;
}

const TRASH_MODULES: TrashModule[] = [
  { tableName: "clients",        module: "Members",       nameColumn: "full_name" },
  { tableName: "products",        module: "Products",      nameColumn: "name" },
  { tableName: "brands",          module: "Brands",        nameColumn: "name" },
  { tableName: "shop_categories", module: "Categories",    nameColumn: "label" },
  { tableName: "trainers",        module: "Trainers",      nameColumn: "name" },
  { tableName: "programs",        module: "Programs",      nameColumn: "title" },
  { tableName: "classes",         module: "Programs",      nameColumn: "title" },
  { tableName: "memberships",     module: "Memberships",   nameColumn: "name" },
  { tableName: "reviews",         module: "Reviews",       nameColumn: "customer_name" },
  { tableName: "offers",          module: "Offers",        nameColumn: "title" },
  { tableName: "blogs",           module: "Blog Posts",    nameColumn: "title" },
];

async function fetchDeleted(mod: TrashModule) {
  const url = `${SUPABASE_URL}/rest/v1/${mod.tableName}?is_deleted=eq.true&order=deleted_at.desc&select=id,${mod.nameColumn},deleted_at,deleted_by`;
  const response = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    // Table may not have is_deleted column yet — return empty
    return [];
  }

  const rows = (await response.json()) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: String(row.id || ""),
    name: String(row[mod.nameColumn] || "—"),
    module: mod.module,
    tableName: mod.tableName,
    deletedAt: String(row.deleted_at || ""),
    deletedBy: String(row.deleted_by || ""),
  }));
}

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 500 });
  }

  try {
    const results = await Promise.allSettled(TRASH_MODULES.map(fetchDeleted));
    const items = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchDeleted>>> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    // Sort by deletedAt desc
    items.sort((a, b) => {
      if (!a.deletedAt) return 1;
      if (!b.deletedAt) return -1;
      return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch trash." },
      { status: 500 }
    );
  }
}
