import './globals.css'
import Nav from '../components/Nav'

export const metadata = {
  title: 'Calar.Artiste · Galerie',
  description: 'Art intuitif & abstrait — Œuvres originales de Calar.Artiste',
  icons: { icon: '/favicon.png' }
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
