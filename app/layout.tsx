import type React from "react"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { AuthProvider } from "@/components/auth-provider"
import { RoleProvider } from "@/contexts/role-context"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { LoadingAnimation } from "@/components/loading-animation"

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
        <LoadingAnimation />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <RoleProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <div className="flex-1">{children}</div>
              </div>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico' }
    ]
  }
};

// Add this to disable Next.js default loading and error UI
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
