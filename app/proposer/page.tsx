import Link from "next/link"

export default function Proposer() {

return (

<main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

<div className="festival-card text-center">

<h1 className="text-3xl mb-4">Proposer votre groupe</h1>

<p className="text-[#1F2A44]/80 mb-6">
Choisissez d&apos;abord une date ouverte pour envoyer une candidature complète.
</p>

<div className="flex flex-wrap justify-center gap-3">
<Link href="/" className="btn-festival">Voir les dates ouvertes</Link>
<Link href="/programmation" className="btn-ghost">Voir la programmation</Link>
</div>

</div>

</main>

)
}