import { NextRequest, NextResponse } from "next/server";

/**
 * Handles both the "Visit / Question" form and (in production) the
 * "Where to Buy" fallback inquiry. Currently just validates and logs —
 * wire up an email provider (Resend, Postmark, SendGrid...) here and
 * point it at Roberto's inbox. Optionally also insert into the
 * `inquiries` table (see /supabase/schema.sql) if he wants a history.
 */

// Confirmed by Roberto — where inquiries should land once a real email
// provider is wired up.
const WINERY_INBOX = "info@vallettigiacinto.it";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { name, email, message, type } = body ?? {};
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // TODO (production): send email via Resend/Postmark/SendGrid to
  // WINERY_INBOX, and/or insert a row into Supabase `inquiries`.
  console.log("New inquiry received:", { type, name, email, to: WINERY_INBOX });

  return NextResponse.json({ ok: true });
}
