// Suppress console.log/info/debug in production, but keep warn and error
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
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
    </>
  )
}

// Disable Next.js development overlay
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args) => {
    if (args[0]?.includes?.('next-dev-overlay')) return
    originalError.call(console, ...args)
  }
}