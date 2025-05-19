// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  return createClientComponentClient();
}
