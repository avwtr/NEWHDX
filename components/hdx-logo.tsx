import Link from "next/link"

// Custom color
const CUSTOM_GREEN = "#A0FFDD"

interface HDXLogoProps {
  className?: string
}

// Update the HDXLogo component to spell out HETERODOX LABS

export function HDXLogo({ className = "" }: HDXLogoProps) {
  return (
    <Link
      href="/landing"
      className={`font-mono font-bold text-xl tracking-tighter hover:opacity-90 transition-opacity ${className}`}
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      <span style={{ color: CUSTOM_GREEN }}>HETERODOX</span>
      <span className="text-white"> LABS</span>
    </Link>
  )
}
