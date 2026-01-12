import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { LayoutWrapper } from '@/components/layout-wrapper'
import ClarityAnalytics from '@/components/ClarityAnalytics'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'AJ Academy',
  description: 'Learn, Grow, and Succeed with AJ Academy',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/ajlogo.jpg', type: 'image/jpeg' }
    ],
    apple: '/ajlogo.jpg',
  },
}

// RootLayout applies to all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/ajlogo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/ajlogo.jpg" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
          <ClarityAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
