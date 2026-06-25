import { createClient } from '@supabase/supabase-js'

// Client admin — écriture, utilise la service_role key
// CE FICHIER NE DOIT ÊTRE IMPORTÉ QUE DANS /app/api/ (côté serveur)
// La service_role key n'est JAMAIS exposée au navigateur
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
