import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const TABLE_NAME = process.env.SUPABASE_GYM_TABLE || "gym_data";
const PAGE_CONTENT_TABLES: Record<string, string> = {
  "fitness-bhaktapur-home-page": "home_page_content",
  "fitness-bhaktapur-about-page": "about_page_content",
};

function getDataTarget(key: string) {
  const pageTable = PAGE_CONTENT_TABLES[key];
  return pageTable
    ? { table: pageTable, select: "id,content", valueColumn: "content", conflictColumn: "id", row: (value: unknown) => ({ id: true, content: value }) }
    : { table: TABLE_NAME, select: "key,value", valueColumn: "value", conflictColumn: "key", row: (value: unknown) => ({ key, value }) };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getKey(request: NextRequest) {
  return request.nextUrl.searchParams.get("key")?.trim();
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

export async function GET(request: NextRequest) {
  try {
    const key = getKey(request);

    if (!key) {
      return jsonError("Missing required key query parameter.", 400);
    }

    const target = getDataTarget(key);
    const filter = target.conflictColumn === "id" ? "id=eq.true" : `key=eq.${encodeURIComponent(key)}`;
    const rows = await supabaseRequest(`${target.table}?${filter}&select=${target.select}&limit=1`);

    return NextResponse.json({
      key,
      value: Array.isArray(rows) && rows[0] ? rows[0][target.valueColumn] : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // If the table doesn't exist yet, return null value gracefully
    // so the frontend falls back to localStorage defaults
    if (
      message.includes("PGRST205") ||
      message.includes("relation") ||
      message.includes("does not exist") ||
      message.includes("schema cache") ||
      !SUPABASE_URL ||
      !SUPABASE_KEY
    ) {
      const key = getKey(request);
      return NextResponse.json({ key: key ?? "", value: null });
    }
    return jsonError(message || "Could not load gym data.", 500);
  }
}

export async function PUT(request: NextRequest) {
  let bodyValue: unknown = null;
  try {
    const key = getKey(request);

    if (!key) {
      return jsonError("Missing required key query parameter.", 400);
    }

    const body = await request.json();

    if (!Object.prototype.hasOwnProperty.call(body, "value")) {
      return jsonError("Request body must include a value field.", 400);
    }

    // Capture value before the Supabase call so the catch block can use it
    bodyValue = (body as { value: unknown }).value;

    const target = getDataTarget(key);
    const rows = await supabaseRequest(`${target.table}?on_conflict=${target.conflictColumn}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([target.row((body as { value: unknown }).value)]),
    });

    return NextResponse.json({
      key,
      value: Array.isArray(rows) && rows[0] ? rows[0][target.valueColumn] : (body as { value: unknown }).value,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // If the table doesn't exist yet, return the submitted value so the
    // frontend still treats the optimistic local write as successful
    if (
      message.includes("PGRST205") ||
      message.includes("relation") ||
      message.includes("does not exist") ||
      message.includes("schema cache") ||
      !SUPABASE_URL ||
      !SUPABASE_KEY
    ) {
      const key = getKey(request);
      return NextResponse.json({ key: key ?? "", value: bodyValue });
    }
    return jsonError(message || "Could not save gym data.", 500);
  }
}
