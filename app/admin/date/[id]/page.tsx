"use client"

import {useCallback,useEffect,useState} from "react"
import {supabase} from "@/lib/supabase"
import Link from "next/link"
import { useParams } from "next/navigation"
import GroupsMap from "@/components/GroupsMap"
import type { CandidatureItem } from "@/lib/types"

export default function Page(){

const params = useParams()
const dateId = params.id as string

const[candidatures,setCandidatures]=useState<CandidatureItem[]>([])
const [loading, setLoading] = useState(false)
const [errorMessage, setErrorMessage] = useState<string | null>(null)

const load = useCallback(async () => {

setLoading(true)
setErrorMessage(null)

const{data, error}=await supabase
.from("candidatures")
.select("*")
.eq("date_id",dateId)
.order("id", { ascending: true })

if (error) {
setErrorMessage("Impossible de charger les candidatures.")
setCandidatures([])
setLoading(false)
return
}

setCandidatures(data || [])
setLoading(false)

}, [dateId])

useEffect(()=>{

const timer = setTimeout(() => {
void load()
}, 0)

return () => clearTimeout(timer)

},[load])

async function accepter(id:string){

setErrorMessage(null)

const { error: acceptError } = await supabase
.from("candidatures")
.update({status:"accepted"})
.eq("id",id)

if (acceptError) {
setErrorMessage("Impossible de confirmer cette candidature.")
return
}

const { error: refuseOthersError } = await supabase
.from("candidatures")
.update({ status: "refused" })
.eq("date_id", dateId)
.neq("id", id)

if (refuseOthersError) {
setErrorMessage("Candidature confirmée, mais impossible de refuser les autres automatiquement.")
}

const { error: dateError } = await supabase
.from("dates")
.update({ status: "confirmed" })
.eq("id", dateId)

if (dateError) {
setErrorMessage("Candidature confirmée, mais le statut de la date n'a pas été mis à jour.")
}

void load()

}

async function refuser(id: string) {
const { error } = await supabase
.from("candidatures")
.update({ status: "refused" })
.eq("id", id)

if (error) {
setErrorMessage("Impossible de refuser cette candidature.")
return
}

void load()

}

return(

<main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

<Link href="/admin" className="btn-ghost inline-flex mb-6">← Retour admin</Link>

<h1 className="text-3xl mb-6">

Candidatures de la date

</h1>

{errorMessage && <p className="mb-4 text-[#D94A4A]">{errorMessage}</p>}

{loading && <p className="text-[#2F5D50]">Chargement...</p>}

{!loading && candidatures.length === 0 && (
<p className="text-[#2F5D50]">Aucune candidature pour cette date.</p>
)}

<section className="grid gap-5 lg:grid-cols-2">
{candidatures.map((c)=>(

<div key={c.id} className="festival-card">

<p className={c.status === "accepted" ? "badge-confirmed mb-2" : c.status === "pending" ? "badge-open mb-2" : "badge-refused mb-2"}>
{c.status === "accepted" ? "Confirmé" : c.status === "pending" ? "En attente" : "Refusé"}
</p>

<h2 className="text-xl font-bold">

{c.nom_groupe}

</h2>

<p className="mt-2 text-[#1F2A44]/80">{c.style_musical || "Style non renseigné"}</p>
<p className="text-[#1F2A44]/80">{c.ville || "Ville non renseignée"}</p>
<p className="mt-3">✉️ {c.email}</p>
<p>📞 {c.contact || "Non renseigné"}</p>
<p>🎚 Cachet : {c.cachet || "À définir"}</p>
<p>🛏 Logement : {c.logement || "À définir"}</p>
<p>👥 Membres : {c.membres ?? "N/A"}</p>
{c.reseaux && <p>🔗 Réseaux : {c.reseaux}</p>}
{c.message && <p className="mt-2">💬 {c.message}</p>}

{c.status !== "accepted" && (
<button
onClick={()=>accepter(c.id)}
className="btn-festival mt-3">

Accepter

</button>
)}

{c.status !== "accepted" && (
<button
onClick={()=>refuser(c.id)}
className="btn-festival mt-3 ml-2">

Refuser

</button>
)}

</div>

))}

</section>

<section className="mt-8">
<h2 className="section-title">Carte des groupes</h2>
<GroupsMap
points={candidatures
.filter((item) => item.latitude !== null && item.longitude !== null)
.map((item) => ({
id: item.id,
name: item.nom_groupe,
city: item.ville || "France",
lat: item.latitude as number,
lng: item.longitude as number,
}))}
/>
</section>

</main>

)

}