import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import path from "path";

export async function uploadFotoToStorage(buffer: Buffer, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, buffer, { upsert: false });
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
