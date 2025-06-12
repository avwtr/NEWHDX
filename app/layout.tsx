import type React from "react"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { RoleProvider } from "@/contexts/role-context"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { GlobalLoader } from "@/components/GlobalLoader"
import { HeaderWrapper } from "@/components/header-wrapper"
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'

// Initialize the JetBrains Mono font
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message.includes('next-dev-overlay')) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <RoleProvider>
              <GlobalLoader />
              <div className="relative flex min-h-screen flex-col">
                <HeaderWrapper />
                <div className="flex-1">{children}</div>
              </div>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        {/* Vercel Analytics */}
        <Analytics />
        {/* Plausible Analytics */}
        <Script
          strategy="afterInteractive"
          data-domain="heterodoxlabs.com"
          src="https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
        />
        <Script
          id="plausible-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible = window.plausible || function() {
                (window.plausible.q = window.plausible.q || []).push(arguments)
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

export const metadata = {
  title: "HDX",
  generator: 'HDX LABS',
  icons: {
    icon: [
      { url: '/iconlogo2.png' }
    ]
  }
};

// Add this to disable Next.js default loading and error UI
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
