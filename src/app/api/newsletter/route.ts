import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let email = "";

  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || email.length > 320 || !EMAIL_PATTERN.test(email)) {
      return error("Please enter a valid email address.", 400);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return error("Newsletter subscriptions are not configured yet.", 503);
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    if (response.ok) {
      return NextResponse.json({ ok: true, message: "You’re subscribed to our newsletter." }, { status: 201 });
    }

    const detail = await response.text();
    if (response.status === 409 || detail.includes("23505")) {
      return error("That email is already subscribed.", 409);
    }

    console.error("Newsletter subscription failed:", response.status, detail);
    return error("We couldn’t subscribe you right now. Please try again.", 502);
  } catch (cause) {
    console.error("Newsletter request failed:", cause);
    return error("We couldn’t subscribe you right now. Please try again.", 500);
  }
}
