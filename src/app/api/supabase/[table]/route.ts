import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Tables that support soft-delete (have is_deleted column)
const SOFT_DELETE_TABLES = new Set([
  "clients",
  "orders",
  "products",
  "brands",
  "shop_categories",
  "trainers",
  "classes",
  "programs",
  "memberships",
  "reviews",
  "offers",
  "blogs",
]);

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
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...init,
    headers: getSupabaseHeaders(init.headers),
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message: unknown }).message)
        : text || response.statusText;
    const details =
      typeof payload === "object" && payload && "details" in payload
        ? String((payload as { details: unknown }).details)
        : "";
    const code =
      typeof payload === "object" && payload && "code" in payload
        ? String((payload as { code: unknown }).code)
        : "";

    console.error(`[Supabase REST Error] ${init.method || "GET"} ${url}`, {
      status: response.status,
      statusText: response.statusText,
      url,
      code,
      message,
      details,
      payload,
      rawText: text,
    });

    const errorObj = new Error(details ? `${message} (${details})` : message) as Error & { status?: number; code?: string };
    errorObj.status = response.status;
    errorObj.code = code;
    throw errorObj;
  }

  return payload;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Build query from search params
    const select = searchParams.get("select") || "*";
    const orderBy = searchParams.get("orderBy");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const eq = searchParams.get("eq");
    const eqColumn = searchParams.get("eqColumn");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const buildPath = (withSoftDelete: boolean) => {
      let path = `${table}?select=${encodeURIComponent(select)}`;

      // Filter out soft-deleted records by default for supported tables
      if (withSoftDelete && SOFT_DELETE_TABLES.has(table) && !includeDeleted) {
        path += `&is_deleted=eq.false`;
      }

      if (eq && eqColumn) {
        path += `&${encodeURIComponent(eqColumn)}=eq.${encodeURIComponent(eq)}`;
      }

      if (orderBy) {
        path += `&order=${encodeURIComponent(orderBy)}`;
      }

      if (limit) {
        path += `&limit=${limit}`;
      }

      if (offset) {
        path += `&offset=${offset}`;
      }

      return path;
    };

    try {
      const data = await supabaseRequest(buildPath(true));
      return NextResponse.json(data);
    } catch (error) {
      // PostgreSQL error 42703 = column does not exist (migration not yet run)
      // Fall back to fetching all rows without the is_deleted filter
      const code = (error as { code?: string }).code;
      if (code === "42703" || (error instanceof Error && error.message.includes("is_deleted"))) {
        console.warn(`[API] Table "${table}" missing is_deleted column — run MIGRATION_SOFT_DELETE.sql. Falling back to unfiltered fetch.`);
        const data = await supabaseRequest(buildPath(false));
        return NextResponse.json(data);
      }
      throw error;
    }
  } catch (error) {
    const status = (error as { status?: number }).status || 500;
    return jsonError(error instanceof Error ? error.message : "Could not load data.", status);
  }
}


export async function POST(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const body = await request.json();

    console.log(`[API POST /api/supabase/${table}] Incoming Payload:`, JSON.stringify(body, null, 2));
    
    const data = await supabaseRequest(table, {
      method: "POST",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify(Array.isArray(body) ? body : [body]),
    });
    
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    const status = (error as { status?: number }).status || 500;
    return jsonError(error instanceof Error ? error.message : "Could not create data.", status);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const idColumn = searchParams.get("idColumn") || "id";
    
    if (!id) {
      return jsonError("Missing id query parameter.", 400);
    }
    
    const data = await supabaseRequest(`${table}?${idColumn}=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update data.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const idColumn = searchParams.get("idColumn") || "id";
    const permanent = searchParams.get("permanent") === "true";
    
    if (!id) {
      return jsonError("Missing id query parameter.", 400);
    }

    // For soft-delete tables: PATCH is_deleted=true unless permanent=true
    if (SOFT_DELETE_TABLES.has(table) && !permanent) {
      try {
        const data = await supabaseRequest(`${table}?${idColumn}=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Prefer": "return=representation" },
          body: JSON.stringify({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
          }),
        });
        return NextResponse.json({ softDeleted: true, data: Array.isArray(data) ? data[0] : data });
      } catch (softDeleteError) {
        // PostgreSQL 42703 = column does not exist — migration not yet run
        // Fall through to hard delete so the operation still succeeds
        const code = (softDeleteError as { code?: string }).code;
        if (code === "42703" || (softDeleteError instanceof Error && softDeleteError.message.includes("is_deleted"))) {
          console.warn(`[API] Table "${table}" missing is_deleted column — run MIGRATION_SOFT_DELETE.sql. Falling back to hard delete.`);
        } else {
          throw softDeleteError;
        }
      }
    }

    // Hard delete (for tables without soft-delete, permanent=true, or fallback)
    await supabaseRequest(`${table}?${idColumn}=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not delete data.", 500);
  }
}
