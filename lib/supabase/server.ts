/**
 * Supabase Server Client
 * 
 * This client uses the service role key and should ONLY be used in:
 * - Server Components
 * - Server Actions
 * - API Routes
 * 
 * NEVER import this in client components!
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase server environment variables. Please check your .env file."
  );
}

/**
 * Server-side Supabase client with admin privileges
 * Use this for server operations that require elevated permissions
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
