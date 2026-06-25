import { createClient } from '@supabase/supabase-js'

// Client public — lecture seule, utilise la anon key
// Cette clé est visible côté client, c'est normal
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
