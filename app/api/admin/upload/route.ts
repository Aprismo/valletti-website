import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * PROTOTYPE upload endpoint: saves an admin-uploaded picture as a real
 * file in /public/uploads, so it survives page reloads and doesn't
 * depend on browser storage at all (unlike the old approach, which kept
 * pictures only in localStorage and could lose them — see admin-store.tsx).
 *
 * IMPORTANT — this only works for local development. Vercel's production
 * runtime has a read-only filesystem (except /tmp, which doesn't persist
 * between requests), so this route will NOT work once deployed. In
 * production this is replaced with a real upload to Supabase Storage —
 * see /supabase/schema.sql and the README's "Going to production" list.
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const originalName = file instanceof File ? file.name : "upload.jpg";
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const fileName = `${Date.now()}-${safeName}`;
  const filePath = path.join(uploadsDir, fileName);

  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${fileName}`, fileName: originalName });
}
