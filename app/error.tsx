'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 