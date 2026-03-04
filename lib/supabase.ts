import { createClient } from "@supabase/supabase-js";

// Admin: service_role, bypassa RLS — server-side ONLY
export const supabaseAdmin = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Anon: respeita RLS — seguro para leituras públicas client-side
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const STORAGE_BUCKET = "fotos-imoveis";
