"use client"

import Link from "next/link"

type DateCardProps = {
	date: string
	id: string
}

export default function DateCard({ date, id }: DateCardProps) {

const formattedDate =
new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR",{
weekday:"long",
day:"numeric",
month:"long",
year:"numeric"
})

return(

<article className="festival-card">

<p className="badge-open mb-3">Date ouverte</p>

<h2 className="text-xl font-bold mb-3">

{formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}

</h2>

<p className="text-sm text-[#1F2A44]/70 mb-4">
Clique sur cette date pour proposer ton groupe.
</p>

<Link href={`/date/${id}`}>

<button className="btn-festival w-full sm:w-auto">

Proposer mon groupe

</button>

</Link>

</article>

)

}