import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QuickAccess } from '@/components/quick-access'

export const metadata: Metadata = {
  metadataBase: new URL('https://fisiofes.com'),
  title: { default: 'Fisiofes | Tu objetivo, tu ruta', template: '%s | Fisiofes' },
  description: 'Una ruta médico-fitness personalizada para aliviar dolor, recuperar movimiento y acercarte a la vida que quieres vivir en Armenia, Quindío.',
  openGraph: { type: 'website', locale: 'es_CO', siteName: 'Fisiofes Physio, Pilates & Training', title: 'Fisiofes | Tu objetivo, tu ruta', description: 'Desde un dolor o un deseo hasta la vida que quieres vivir, con profesionales, tecnología y humanidad en cada paso.' },
  twitter: { card: 'summary_large_image', title: 'Fisiofes | Tu objetivo, tu ruta', description: 'Una ruta médico-fitness personalizada que se adapta a ti.' },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#44D0D2', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className="bg-background"><body>{children}<QuickAccess /></body></html>
}
