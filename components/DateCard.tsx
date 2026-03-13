"use client"

import Link from "next/link"

type DateCardProps = {
	date: string
	id: string
	description?: string | null
	eventType?: string | null
	firstPartTitle?: string | null
}

function eventTypeLabel(value?: string | null) {
if (value === "jam_session") return "Jam session"
if (value === "soiree_thematique") return "Soiree thematique"
if (value === "autre") return "Evenement special"
return "Concert"
}

export default function DateCard({ date, id, description, eventType, firstPartTitle }: DateCardProps) {

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

<p className="text-xs font-semibold uppercase tracking-wide text-[#2F5D50] mb-2">
{eventTypeLabel(eventType)}
</p>

<h2 className="text-xl font-bold mb-3">

{formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}

</h2>

<p className="text-sm text-[#1F2A44]/70 mb-2">
Clique sur cette date pour proposer ton groupe.
</p>

{description && (
<p className="text-sm text-[#1F2A44]/85 mb-4 whitespace-pre-wrap">
{description}
</p>
)}

{firstPartTitle && (
<p className="text-sm text-[#1F2A44]/70 mb-4">
Premiere partie envisagee: <strong>{firstPartTitle}</strong>
</p>
)}

<Link href={`/date/${id}`}>

<button className="btn-festival w-full sm:w-auto">

Proposer mon groupe

</button>

</Link>

</article>

)

}