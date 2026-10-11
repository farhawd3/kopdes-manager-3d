import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { modeDemo } from '@/lib/demo';
import { demoDb } from './demo-db';
export function db(): SupabaseClient {
  // Mode demo lokal: data contoh di memori, tidak pernah menyentuh Supabase.
  if (modeDemo()) return demoDb() as unknown as SupabaseClient;
  const url = process.env.HUB_SUPABASE_URL;
  const key = process.env.HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key)
    throw new Error(
      'Supabase baru belum dikonfigurasi. Isi HUB_SUPABASE_URL dan HUB_SUPABASE_SERVICE_KEY di server.',
    );
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
