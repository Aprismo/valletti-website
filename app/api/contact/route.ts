import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the "Visit / Question" form: validates the request and emails it
 * to the winery via Resend (https://resend.com).
 *
 * Env vars (see .env.example):
 *   RESEND_API_KEY        — API key from Resend
 *   CONTACT_NOTIFY_EMAIL  — inbox that receives the requests
 *   CONTACT_FROM_EMAIL    — sender, on a domain verified in Resend
 *
 * Without these set, requests are only logged in local development, and
 * rejected in production (so the visitor sees an error instead of the
 * request silently disappearing).
 *
 * Spam protection: a hidden "website" field that people never see (bots
 * that fill it in get a fake success), and a limit of RATE_LIMIT requests
 * per IP address per RATE_WINDOW_MS. The limit is kept in memory, so on
 * Vercel it applies per server instance — enough to stop a simple flood,
 * not a determined attacker (Resend's own quotas are the backstop).
 */

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const recentRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (recentRequests.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  recentRequests.set(ip, recent);
  // Keep the map from growing forever.
  if (recentRequests.size > 5000) {
    for (const [key, times] of recentRequests) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) recentRequests.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
}

const FIELDS: [key: string, label: string][] = [
  ["type", "Type"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["country", "Country"],
  ["preferredDate", "Preferred date"],
  ["guests", "Guests"],
  ["locale", "Site language"],
  ["message", "Message"],
];

const clean = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

  // Honeypot filled in -> almost certainly a bot. Pretend it worked.
  if (clean(body?.website)) {
    return NextResponse.json({ ok: true });
  }

  const data = Object.fromEntries(FIELDS.map(([key]) => [key, clean(body?.[key])]));
  const { name, email, message } = data;
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log("New inquiry (email not configured, not sent):", data);
      return NextResponse.json({ ok: true });
    }
    console.error("Contact form: RESEND_API_KEY / CONTACT_NOTIFY_EMAIL / CONTACT_FROM_EMAIL missing");
    return NextResponse.json({ error: "Email is not configured." }, { status: 500 });
  }

  const oneLineName = name.replace(/\s+/g, " ");
  const subject =
    data.type === "visit" ? `Visit request from ${oneLineName}` : `Question from ${oneLineName}`;
  const text = FIELDS.filter(([key]) => data[key])
    .map(([key, label]) => (key === "message" ? `\n${label}:\n${data[key]}` : `${label}: ${data[key]}`))
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      reply_to: email,
      subject: subject.slice(0, 200),
      text,
    }),
  });

  if (!res.ok) {
    console.error("Resend error:", res.status, await res.text());
    return NextResponse.json({ error: "Could not send your message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
