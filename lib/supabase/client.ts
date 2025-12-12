/**
 * Supabase Client for Browser/Client Components
 * 
 * This client is safe to use in client components and browser code.
 * Uses the anon key which has limited permissions based on RLS policies.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

/**
 * Browser-safe Supabase client
 * Use this for client-side operations like file uploads
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We handle auth separately with Better Auth
  },
});
