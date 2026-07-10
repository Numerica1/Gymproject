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
    
    let path = `${table}?select=${encodeURIComponent(select)}`;
    
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

    const data = await supabaseRequest(path);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load data.", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const body = await request.json();
    
    const data = await supabaseRequest(table, {
      method: "POST",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify(Array.isArray(body) ? body : [body]),
    });
    
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create data.", 500);
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
    
    if (!id) {
      return jsonError("Missing id query parameter.", 400);
    }
    
    await supabaseRequest(`${table}?${idColumn}=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not delete data.", 500);
  }
}
