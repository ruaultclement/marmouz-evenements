"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function FestivalHeader(){

const pathname = usePathname()

const isActive = (href: string) => {
  if (href === "/") {
    return pathname === "/" || (pathname.startsWith("/date") && !pathname.includes("/admin"))
  }
  return pathname.startsWith(href)
}

return(

<header className="bg-linear-to-b from-[#F5EBE0] to-[#F5EBE0] py-4 px-4 sm:px-8 mb-0">

<div className="flex flex-col items-center">

{/* Logo - Full page header, larger */}
<div className="w-full max-w-6xl">
<picture>
  <source srcSet="/images/logo-header.webp" type="image/webp" />
  <img
    src="/images/logo-header.png"
    alt="La Guinguette des Marmouz"
    className="w-full h-auto object-contain"
    loading="eager"
  />
</picture>
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