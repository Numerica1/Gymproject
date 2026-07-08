import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const TABLE_NAME = process.env.SUPABASE_GYM_TABLE || "gym_data";
const BOOKINGS_KEY = "fitness-bhaktapur-bookings-list";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
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

interface BookingItem {
  bookingId: string;
  member: string;
  service: string;
  date: string;
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, member, service, date } = body;

    if (!bookingId || !member || !service) {
      return jsonError("bookingId, member, and service are required.", 400);
    }

    const encodedKey = encodeURIComponent(BOOKINGS_KEY);
    const rows = await supabaseRequest(`${TABLE_NAME}?key=eq.${encodedKey}&select=key,value&limit=1`);

    const currentBookings = (Array.isArray(rows) && rows[0]?.value) || [];

    const newBooking: BookingItem = {
      bookingId,
      member,
      service,
      date: date || new Date().toISOString(),
      status: "Upcoming",
    };

    const updatedBookings = [newBooking, ...currentBookings];

    const upsertRows = await supabaseRequest(`${TABLE_NAME}?on_conflict=key`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([{ key: BOOKINGS_KEY, value: updatedBookings }]),
    });

    const savedBooking =
      Array.isArray(upsertRows) && upsertRows[0]?.value
        ? (upsertRows[0].value as BookingItem[]).find((b) => b.bookingId === bookingId) || newBooking
        : newBooking;

    return NextResponse.json({ ok: true, booking: savedBooking });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not save booking.",
      500
    );
  }
}
