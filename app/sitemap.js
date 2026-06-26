import { supabase } from '@/lib/supabase'

const BASE_URL = 'https://calartiste.vercel.app'

export default async function sitemap() {
  // Pages statiques
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/galerie`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Pages dynamiques — une URL par œuvre
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, updated_at, created_at')

  const artworkPages = (artworks || []).map(a => ({
    url: `${BASE_URL}/oeuvre/${a.id}`,
    lastModified: new Date(a.updated_at || a.created_at),
    changeFrequency: 'monthly',
    priority: 0.8
  }))

  return [...staticPages, ...artworkPages]
}
