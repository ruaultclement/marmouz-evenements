"use client"

import {useCallback,useEffect,useState} from "react"
import {useRouter} from "next/navigation"
import {supabase} from "@/lib/supabase"
import Link from "next/link"
import FestivalHeader from "@/components/FestivalHeader"
import StatCard from "@/components/StatCard"
import type { CandidatureItem, DateItem } from "@/lib/types"

export default function Admin(){

const router = useRouter()
const[dates,setDates]=useState<DateItem[]>([])
const [candidatures, setCandidatures] = useState<CandidatureItem[]>([])
const[newDate,setNewDate]=useState("")
const [loading, setLoading] = useState(false)
const [errorMessage, setErrorMessage] = useState<string | null>(null)
const [isAuthed, setIsAuthed] = useState(false)

const checkAuth = useCallback(() => {
const token = localStorage.getItem("adminToken")
if (!token) {
router.push("/admin/login")
} else {
setIsAuthed(true)
}
}, [router])

useEffect(()=>{
checkAuth()
},[checkAuth])

const load = useCallback(async () => {

setLoading(true)
setErrorMessage(null)

const{data, error}=await supabase
.from("dates")
.select("*")
.order("date")

const { data: candidaturesData } = await supabase
.from("candidatures")
.select("*")

if (error) {
setErrorMessage("Impossible de charger les dates.")
setDates([])
setCandidatures([])
setLoading(false)
return
}

setDates(data || [])
setCandidatures((candidaturesData || []) as CandidatureItem[])
setLoading(false)

}, [])

useEffect(()=>{

const timer = setTimeout(() => {
void load()
}, 0)

return () => clearTimeout(timer)

},[load])

async function addDate(){

if (!newDate) {
setErrorMessage("Choisis une date avant d'ajouter.")
return
}

setErrorMessage(null)

const { error } = await supabase
.from("dates")
.insert({

date:newDate,
status:"open"

})

if (error) {
setErrorMessage("Impossible d'ajouter la date.")
return
}

setNewDate("")
void load()

}

async function deleteDate(dateId: string) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette date et toutes ses candidatures ?")) {
    return
  }

  const password = prompt("Entrez le mot de passe admin pour confirmer la suppression:")
  if (!password) return

  try {
    const response = await fetch(`/api/admin/dates/${dateId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      setErrorMessage("")
      void load()
    } else {
      const data = await response.json()
      setErrorMessage(data.error || "Erreur lors de la suppression de la date.")
    }
  } catch (err) {
    setErrorMessage("Erreur de connexion serveur")
  }
}

const handleLogout = () => {
localStorage.removeItem("adminToken")
router.push("/admin/login")
}

if (!isAuthed) {
return null
}

return(

<main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

<FestivalHeader/>

<section className="mb-8 flex justify-between items-center">
<h1 className="text-3xl font-bold">Tableau de bord admin</h1>
<button onClick={handleLogout} className="btn-ghost">
Déconnexion
</button>
</section>

<section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<StatCard
label="Dates ouvertes"
value={dates.filter((date) => date.status === "open").length}
accent="green"
/>
<StatCard
label="Dates confirmées"
value={dates.filter((date) => date.status === "confirmed").length}
accent="blue"
/>
<StatCard
label="Candidatures en attente"
value={candidatures.filter((item) => item.status === "pending").length}
accent="yellow"
/>
<StatCard
label="Groupes uniques"
value={new Set(candidatures.map((item) => item.nom_groupe.trim().toLowerCase())).size}
accent="red"
/>
</section>

<section className="festival-card mb-8">

<h2 className="text-2xl mb-6">📅 Gestion des dates</h2>

{errorMessage && <p className="mb-4 text-[#D94A4A]">{errorMessage}</p>}

<div className="flex flex-col sm:flex-row gap-3">
<input
type="date"
className="input mb-0"
value={newDate}
onChange={(e)=>setNewDate(e.target.value)}
/>

<button
onClick={addDate}
className="btn-festival whitespace-nowrap">

Ajouter date

</button>
</div>

</section>

<section className="mb-8 flex flex-col sm:flex-row gap-4">
<Link href="/admin/groupes" className="flex-1">
<button className="btn-festival w-full">
👥 Gérer les groupes confirmés →
</button>
</Link>
<Link href="/admin/seed" className="flex-1">
<button className="btn-festival w-full bg-[#D94A4A] hover:bg-[#B83A3A]">
🌱 Générer données test
</button>
</Link>
</section>

<section>
<h2 className="section-title">Dates & candidatures</h2>

{loading && <p className="text-[#2F5D50]">Chargement...</p>}

{!loading && dates.length === 0 && (
<p className="text-[#2F5D50]">Aucune date créée pour le moment.</p>
)}

{dates.map((d)=>(

<div key={d.id} className="festival-card">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
<div>
<p className="font-semibold">{new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
<p className="text-sm mt-1">Statut : {d.status === "open" ? "ouverte" : "confirmée"}</p>
<p className="text-sm mt-1 text-[#1F2A44]/70">
{candidatures.filter((c) => c.date_id === d.id).length} candidature(s)
</p>
</div>

<div className="flex flex-col sm:flex-row gap-2">
<Link href={`/admin/date/${d.id}`}>
<button className="btn-festival sm:mt-0">
Voir candidatures
</button>
</Link>
<button 
  onClick={() => deleteDate(d.id)} 
  className="btn-ghost hover:bg-red-100 border border-red-300 text-red-700 font-semibold"
>
  Supprimer
</button>
</div>

</div>

</div>

))}

</section>

</main>

)

}