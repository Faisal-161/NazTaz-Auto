import { Archivo, Big_Shoulders } from 'next/font/google'
import { announcementScript } from '@/lib/announcement'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { StickyFitCta } from '@/components/layout/StickyFitCta'
import { ToasterHost } from '@/components/ui/ToasterHost'
import { announcement, header, states } from '@/content/layout'
import { pageMetadata } from '@/lib/seo/metadata'
import './globals.css'

// Body: Archivo (variable, incl. width axis for condensed labels). Display: Big Shoulders, a
// condensed signage face (automotive, not the default "AI dark theme" grotesk).
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
})
const display = Big_Shoulders({
  variable: '--font-big-shoulders',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
})

export const metadata = pageMetadata()

export const viewport = {
  themeColor: '#0c0b0a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${display.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies dismissed-announcement state before paint (no flash, no CLS). */}
        <script dangerouslySetInnerHTML={{ __html: announcementScript(announcement.id) }} />
      </head>
      <body className="flex min-h-dvh flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <a
          href="#main"
          className="sr-only z-toast rounded-md bg-accent px-4 py-2 font-medium text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {header.skipLink}
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
        <Footer />
        <StickyFitCta />
        <ToasterHost closeLabel={states.dismissToast} />
      </body>
    </html>
  )
}
