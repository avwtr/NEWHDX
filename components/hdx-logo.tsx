import Link from "next/link"
import Image from "next/image"

interface HDXLogoProps {
  className?: string
}

export function HDXLogo({ className = "" }: HDXLogoProps) {
  return (
    <Link
      href="/landing"
      className={`hover:opacity-90 transition-opacity ${className}`}
    >
      <Image
        src="/HETERODOX LABS.png"
        alt="HETERODOX LABS"
        width={175}
        height={42}
        className="h-7 md:h-8 w-auto object-contain"
        priority
      />
    </Link>
  )
}
