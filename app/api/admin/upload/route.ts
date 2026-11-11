import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * LOCAL DEVELOPMENT ONLY: saves an admin-uploaded picture under
 * /public/uploads when Supabase isn't configured.
 *
 * In production the admin panel uploads straight to the Supabase `media`
 * storage bucket instead (see uploadFile in lib/admin-store.tsx), and this
 * route is switched off — Vercel's filesystem is read-only anyway, and an
 * unauthenticated write endpoint shouldn't be reachable on the live site.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

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
