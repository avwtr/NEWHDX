import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// Disable Next.js development overlay
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args) => {
    if (args[0]?.includes?.('next-dev-overlay')) return
    originalError.call(console, ...args)
  }
} 