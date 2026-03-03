"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoHeaderSVG } from "./LogoHeaderSVG"

export default function FestivalHeader(){

const pathname = usePathname()

const isActive = (href: string) => {
  if (href === "/") {
    return pathname === "/" || (pathname.startsWith("/date") && !pathname.includes("/admin"))
  }
  return pathname.startsWith(href)
}

return(

<header className="bg-gradient-to-b from-[#F5EBE0] to-[#F5EBE0] py-4 px-4 sm:px-8 mb-0">

<div className="flex flex-col items-center">

{/* Logo - Full page header, larger */}
<div className="w-full max-w-6xl">
<img 
  src="/images/logo-header.png" 
  alt="La Guinguette des Marmouz" 
  className="w-full h-auto object-contain"
  onError={(e) => {
    // Hide broken image and show SVG
    const img = e.currentTarget as HTMLImageElement
    img.style.display = "none"
    const parent = img.parentElement
    if (parent && !parent.querySelector("svg")) {
      const svgDiv = document.createElement("div")
      svgDiv.innerHTML = `<svg viewBox="0 0 1200 400" class="w-full h-auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="400" fill="#F5EBE0"/><text x="100" y="140" font-family="cursive, italic" font-size="70" font-style="italic" fill="#2F5D50" font-weight="300" letter-spacing="-2">La guinguette des</text><text x="100" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="none" stroke="#D94A4A" stroke-width="5" letter-spacing="4">MARMOUZ</text><text x="100" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="#F5EBE0" letter-spacing="4">MARMOUZ</text><g transform="translate(1000, 100)"><circle cx="0" cy="0" r="40" fill="#2F5D50"/><circle cx="0" cy="0" r="35" fill="#4A7A6D"/><circle cx="-15" cy="-10" r="7" fill="#F5EBE0"/><circle cx="15" cy="-10" r="7" fill="#F5EBE0"/><circle cx="-15" cy="-10" r="3" fill="#2F5D50"/><circle cx="15" cy="-10" r="3" fill="#2F5D50"/><path d="M -8 8 Q 0 14 8 8" stroke="#2F5D50" stroke-width="2" fill="none"/><ellipse cx="0" cy="55" rx="32" ry="50" fill="#2F5D50"/><ellipse cx="-40" cy="35" rx="14" ry="40" fill="#2F5D50" transform="rotate(-25 -40 35)"/><ellipse cx="40" cy="35" rx="14" ry="40" fill="#2F5D50" transform="rotate(25 40 35)"/><g transform="translate(60, 0)"><path d="M 0 30 L 8 0 L 18 0 L 28 30 Z" fill="#D94A4A" opacity="0.85" stroke="#8B3A3A" stroke-width="1"/><ellipse cx="14" cy="0" rx="8" ry="4" fill="#D94A4A" opacity="0.6"/><path d="M 8 12 L 18 12 Z" stroke="#F5EBE0" stroke-width="1"/><path d="M 2 30 L 5 15 L 23 15 L 26 30 Z" fill="#E8B4B4" opacity="0.5"/></g></g></svg>`
      parent.appendChild(svgDiv)
    }
  }}
/>
</div>

{/* Navigation with active indicator */}
<nav className="flex flex-wrap items-center justify-center gap-1">
<Link href="/">
<button className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
isActive("/") 
  ? "text-[#2F5D50] bg-[#F6C945] hover:bg-[#F6C945]/90" 
  : "text-[#2F5D50] hover:bg-[#1F2A44]/5"
}`}>
Dates
</button>
</Link>
<span className="text-[#1F2A44]/30">•</span>
<Link href="/programmation">
<button className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
isActive("/programmation") 
  ? "text-[#2F5D50] bg-[#F6C945] hover:bg-[#F6C945]/90" 
  : "text-[#2F5D50] hover:bg-[#1F2A44]/5"
}`}>
Programmation
</button>
</Link>
<span className="text-[#1F2A44]/30">•</span>
<Link href="/lieu">
<button className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
isActive("/lieu") 
  ? "text-[#2F5D50] bg-[#F6C945] hover:bg-[#F6C945]/90" 
  : "text-[#2F5D50] hover:bg-[#1F2A44]/5"
}`}>
Le Lieu
</button>
</Link>
</nav>

</div>

</header>

)

}