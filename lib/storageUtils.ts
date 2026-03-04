import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import path from "path";

export async function uploadFotoToStorage(buffer: Buffer, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase().replace(".", "") || "jpg";
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
  };

  const contentType = mimeMap[ext] ?? "image/jpeg";

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, buffer, { contentType, upsert: false }); // ✅ fix

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(fileName).data.publicUrl;
}

export async function deleteFotoFromStorage(publicUrl: string): Promise<void> {
  try {
    const parts = new URL(publicUrl).pathname.split(`/${STORAGE_BUCKET}/`);
    if (parts.length >= 2) {
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([parts[1]]);
    }
  } catch {
    // ignore — foto pode não existir no Storage (URL local legada)
  }
}