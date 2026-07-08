import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const TABLE = "contact_messages";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getHeaders(extra?: HeadersInit): HeadersInit {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env."
    );
  }
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...extra,
  };
}

async function supabaseRequest<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: getHeaders(init.headers),
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
  return payload as T;
}

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  created_at: string;
}

// POST  /api/contact  – insert a new contact message into Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, subject, message, date } = body;

    if (!name || !email || !message) {
      return jsonError("name, email and message are required.", 400);
    }

    const row = {
      id,          // we supply the uuid so we can match it for deletion later
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      created_at: date || new Date().toISOString(),
    };

    const rows = await supabaseRequest<ContactMessageRow[] | ContactMessageRow>(TABLE, {
      method: "POST",
      body: JSON.stringify(row),
    });

    return NextResponse.json({ ok: true, row: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not save contact message.",
      500
    );
  }
}

// DELETE /api/contact?id=<uuid>  – delete a message by its id
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return jsonError("Missing required id query parameter.", 400);
    }

    await supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    return NextResponse.json({ ok: true, deleted: id });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not delete contact message.",
      500
    );
  }
}
