import './globals.css'
import Nav from '@/components/Nav'

const BASE_URL = 'https://calartiste.vercel.app'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Calar.Artiste — Art intuitif & abstrait',
    template: '%s · Calar.Artiste'
  },
  description: 'Découvrez les œuvres originales de Clara, infirmière et artiste. Art intuitif et abstrait qui voyage entre émotion, nature et guérison. Acrylique, pointillisme, techniques mixtes.',
  keywords: ['art intuitif', 'art abstrait', 'peinture originale', 'Calar artiste', 'Clara artiste', 'acrylique', 'pointillisme', 'œuvres originales', 'galerie art'],
  authors: [{ name: 'Clara — Calar.Artiste' }],
  creator: 'Calar.Artiste',
  publisher: 'Calar.Artiste',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'Calar.Artiste',
    title: 'Calar.Artiste — Art intuitif & abstrait',
    description: 'Œuvres originales de Clara — art intuitif et abstrait entre émotion, nature et guérison.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Calar.Artiste — Galerie' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calar.Artiste — Art intuitif & abstrait',
    description: 'Œuvres originales de Clara — art intuitif et abstrait entre émotion, nature et guérison.',
    images: ['/og-image.jpg'],
    creator: '@calar.artiste'
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png'
  },
  alternates: {
    canonical: BASE_URL
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* JSON-LD — Données structurées pour Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ArtGallery',
            name: 'Calar.Artiste',
            description: 'Galerie d\'art en ligne de Clara, artiste peintre spécialisée en art intuitif et abstrait.',
            url: BASE_URL,
            sameAs: ['https://www.instagram.com/calar.artiste'],
            artist: {
              '@type': 'Person',
              name: 'Clara',
              alternateName: 'Calar.Artiste',
              jobTitle: 'Artiste peintre',
              sameAs: ['https://www.instagram.com/calar.artiste']
            }
          })}}
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
