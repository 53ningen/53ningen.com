import Footer from '@/components/common/Footer'
import Header from '@/components/common/Header'
import { currentBaseUrl, currentLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ReactNode } from 'react'
import './globals.css'

export async function generateMetadata() {
  const { common } = await getDictionary()
  const { title, description } = common

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    icons: {
      icon: '/favicon.png',
      apple: './favicon192x192.png',
    },
    metadataBase: currentBaseUrl,
    openGraph: {
      title,
      description,
      siteName: title,
      locale: currentLocale,
      type: 'website',
      images: [
        {
          url: `${currentBaseUrl}/favicon192x192.png`,
          width: 192,
          height: 192,
        },
      ],
    },
    twitter: {
      title,
      description,
      creator: '@gomi_ningen',
      images: [`${currentBaseUrl}/favicon192x192.png`],
      card: 'summary',
    },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={currentLocale}>
      <body className="xl:max-w-screen-xl xl:mx-auto">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
