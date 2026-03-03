import { createClient } from "@supabase/supabase-js";

// Cliente server-side com service role key (permissão total no Storage)
// Nunca expor no client-side
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const STORAGE_BUCKET = "fotos-imoveis";
