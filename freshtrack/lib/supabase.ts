import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://icmozzozwkmkcfanpmkf.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_JZZinmRoATn2Is7iNTOmgA__i3-vhW5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function throwIfError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}
