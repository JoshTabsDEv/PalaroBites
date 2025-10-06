// lib/supabase-client.ts - Client-side only
import { createBrowserClient } from '@supabase/ssr';

// Client-side client (for React components)
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
