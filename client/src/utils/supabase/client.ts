import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://nbhaffytdahvurjgabcs.supabase.co'
) as string;

const supabaseAnonKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaGFmZnl0ZGFodnVyamdhYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNDY3NzQsImV4cCI6MjEwMzcyMjc3NH0.jYJH7_2sFdHdSgqZL_NXJi4YHgW-Liv3XZK98q30s0Q'
) as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing Supabase URL or Publishable/Anon Key');
}

/**
 * Singleton Supabase browser client.
 * Auth sessions are automatically persisted and refreshed.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

export default supabase;
