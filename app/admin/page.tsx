"use client"

import {useCallback,useEffect,useState} from "react"
import {useRouter} from "next/navigation"
import {supabase} from "@/lib/supabase"
import Link from "next/link"
import FestivalHeader from "@/components/FestivalHeader"
import StatCard from "@/components/StatCard"
import type { CandidatureItem, DateItem, EventType } from "@/lib/types"

type DateSettingsDraft = {
description: string
event_type: EventType
first_part_title: string
show_on_programmation: boolean
highlight_group: boolean
programmation_title: string
programmation_details: string
spectacle_license: string
}

const EVENT_TYPE_OPTIONS: Array<{ value: EventType; label: string }> = [
{ value: "concert", label: "Concert" },
{ value: "jam_session", label: "Jam session" },
{ value: "soiree_thematique", label: "Soirée thématique" },
{ value: "autre", label: "Autre" },
]

const DEFAULT_CANDIDATURE_GUIDELINES =
"Nous sommes une guinguette conviviale : les concerts s\'inscrivent dans une offre globale gratuite pour notre clientèle. Nous cherchons des propositions de qualité avec un budget réaliste et adapté au lieu."

function getDefaultSettingsDraft(item?: DateItem): DateSettingsDraft {
return {
description: item?.description || "",
event_type: item?.event_type || "concert",
first_part_title: item?.first_part_title || "",
show_on_programmation: item?.show_on_programmation ?? true,
highlight_group: item?.highlight_group ?? true,
programmation_title: item?.programmation_title || "",
programmation_details: item?.programmation_details || "",
spectacle_license: item?.spectacle_license || "",
}
}

function applyEventTypePreset(current: DateSettingsDraft, eventType: EventType): DateSettingsDraft {
if (eventType !== "jam_session") {
return { ...current, event_type: eventType }
}

return {
...current,
event_type: "jam_session",
highlight_group: false,
programmation_title: current.programmation_title || "Grande Jam Session",
programmation_details:
current.programmation_details ||
"Scene ouverte et moments d'impro: venez jammer avec nous dans une ambiance decontractee.",
}
}

export default function Admin(){

const router = useRouter()
const[dates,setDates]=useState<DateItem[]>([])
const [candidatures, setCandidatures] = useState<CandidatureItem[]>([])
const[newDate,setNewDate]=useState("")
const [newDateSettings, setNewDateSettings] = useState<DateSettingsDraft>(getDefaultSettingsDraft())
const [dateSettingsDrafts, setDateSettingsDrafts] = useState<Record<string, DateSettingsDraft>>({})
const [savingDateSettingsId, setSavingDateSettingsId] = useState<string | null>(null)
const [candidatureGuidelines, setCandidatureGuidelines] = useState(DEFAULT_CANDIDATURE_GUIDELINES)
const [savingCandidatureGuidelines, setSavingCandidatureGuidelines] = useState(false)
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

const { data: settingsData } = await supabase
.from("site_settings")
.select("key, value_text")
.eq("key", "candidature_guidelines")
.maybeSingle()

if (error) {
setErrorMessage("Impossible de charger les dates.")
setDates([])
setCandidatures([])
setLoading(false)
return
}

setDates(data || [])
setCandidatures((candidaturesData || []) as CandidatureItem[])
setDateSettingsDrafts(
  ((data || []) as DateItem[]).reduce<Record<string, DateSettingsDraft>>((acc, item) => {
    acc[item.id] = getDefaultSettingsDraft(item)
    return acc
  }, {})
)
if (settingsData?.value_text) {
setCandidatureGuidelines(settingsData.value_text)
} else {
setCandidatureGuidelines(DEFAULT_CANDIDATURE_GUIDELINES)
}
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
description:newDateSettings.description.trim() || null,
event_type:newDateSettings.event_type,
first_part_title:newDateSettings.first_part_title.trim() || null,
show_on_programmation:newDateSettings.show_on_programmation,
highlight_group:newDateSettings.highlight_group,
programmation_title:newDateSettings.programmation_title.trim() || null,
programmation_details:newDateSettings.programmation_details.trim() || null,
spectacle_license:newDateSettings.spectacle_license.trim() || null,
status:"open"

})

if (error) {
const missingKnownColumn = ["description", "event_type", "first_part_title", "show_on_programmation", "highlight_group", "programmation_title", "programmation_details", "spectacle_license"].some((column) =>
  (error.message || "").toLowerCase().includes(column)
)

if (missingKnownColumn) {
const { error: fallbackError } = await supabase
.from("dates")
.insert({
date:newDate,
status:"open"
})

if (fallbackError) {
setErrorMessage("Impossible d'ajouter la date.")
return
}
} else {
setErrorMessage("Impossible d'ajouter la date.")
return
}
}

setNewDate("")
setNewDateSettings(getDefaultSettingsDraft())
void load()

}

async function saveDateSettings(dateId: string) {
  setSavingDateSettingsId(dateId)
  setErrorMessage(null)

  const settings = dateSettingsDrafts[dateId] || getDefaultSettingsDraft()

  const { error } = await supabase
    .from("dates")
    .update({
      description: settings.description.trim() || null,
      event_type: settings.event_type,
      first_part_title: settings.first_part_title.trim() || null,
      show_on_programmation: settings.show_on_programmation,
      highlight_group: settings.highlight_group,
      programmation_title: settings.programmation_title.trim() || null,
      programmation_details: settings.programmation_details.trim() || null,
      spectacle_license: settings.spectacle_license.trim() || null,
    })
    .eq("id", dateId)

  if (error) {
  const missingKnownColumn = ["description", "event_type", "first_part_title", "show_on_programmation", "highlight_group", "programmation_title", "programmation_details", "spectacle_license"].some((column) =>
    (error.message || "").toLowerCase().includes(column)
  )
  if (missingKnownColumn) {
  setErrorMessage("Certaines colonnes n'existent pas encore. Applique les migrations V5/V7 d'abord.")
  } else {
  setErrorMessage("Impossible de sauvegarder les paramètres de la date.")
  }
    setSavingDateSettingsId(null)
    return
  }

  setSavingDateSettingsId(null)
  void load()
}

async function saveCandidatureGuidelines() {
setSavingCandidatureGuidelines(true)
setErrorMessage(null)

const { error } = await supabase
.from("site_settings")
.upsert({ key: "candidature_guidelines", value_text: candidatureGuidelines.trim() || DEFAULT_CANDIDATURE_GUIDELINES }, { onConflict: "key" })

if (error) {
const tableMissing = (error.message || "").toLowerCase().includes("site_settings")
if (tableMissing) {
setErrorMessage("La table site_settings n'existe pas encore. Applique la migration V8.")
} else {
setErrorMessage("Impossible de sauvegarder le texte de candidature.")
}
setSavingCandidatureGuidelines(false)
return
}

setSavingCandidatureGuidelines(false)
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

<textarea
className="input mt-3"
rows={3}
placeholder="Description optionnelle de la date (infos techniques, ambiance, contraintes sonores...)"
value={newDateSettings.description}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
description: e.target.value,
}))
}
/>

<div className="grid gap-3 sm:grid-cols-2 mt-3">
<label className="text-sm font-semibold">
Type d&apos;événement
<select
className="input mt-1"
value={newDateSettings.event_type}
onChange={(e) =>
setNewDateSettings((current) =>
applyEventTypePreset(current, e.target.value as EventType)
)
}
>
{EVENT_TYPE_OPTIONS.map((option) => (
<option key={option.value} value={option.value}>{option.label}</option>
))}
</select>
</label>

<label className="text-sm font-semibold">
Première partie (optionnel)
<input
className="input mt-1"
placeholder="Ex: Duo acoustique local"
value={newDateSettings.first_part_title}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
first_part_title: e.target.value,
}))
}
/>
</label>
</div>

<div className="grid gap-3 sm:grid-cols-2 mt-3">
<label className="text-sm font-semibold">
Titre programmation (optionnel)
<input
className="input mt-1"
placeholder="Ex: Grande Jam des Marmouz"
value={newDateSettings.programmation_title}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
programmation_title: e.target.value,
}))
}
/>
</label>

<label className="text-sm font-semibold">
Numero licence spectacle (optionnel)
<input
className="input mt-1"
placeholder="Ex: PLATESV-R-2026-000123"
value={newDateSettings.spectacle_license}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
spectacle_license: e.target.value,
}))
}
/>
</label>
</div>

<textarea
className="input mt-3"
rows={3}
placeholder="Texte programmation (utile pour jam session sans groupe mis en avant)"
value={newDateSettings.programmation_details}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
programmation_details: e.target.value,
}))
}
/>

<div className="flex flex-col sm:flex-row gap-4 mt-3 text-sm">
<label className="inline-flex items-center gap-2">
<input
type="checkbox"
checked={newDateSettings.show_on_programmation}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
show_on_programmation: e.target.checked,
}))
}
/>
Afficher dans la programmation publique
</label>

<label className="inline-flex items-center gap-2">
<input
type="checkbox"
checked={newDateSettings.highlight_group}
onChange={(e) =>
setNewDateSettings((current) => ({
...current,
highlight_group: e.target.checked,
}))
}
/>
Mettre un groupe en avant (désactiver pour une jam session)
</label>
</div>

</section>

<section className="festival-card mb-8">
<h2 className="text-2xl mb-4">Texte global candidature</h2>
<p className="text-sm text-[#1F2A44]/75 mb-2">
Ce texte sera affiché dans la modale candidature pour expliquer l\'esprit guinguette et le cadre budget/licence.
</p>
<textarea
className="input"
rows={4}
value={candidatureGuidelines}
onChange={(e) => setCandidatureGuidelines(e.target.value)}
/>
<button
onClick={() => void saveCandidatureGuidelines()}
disabled={savingCandidatureGuidelines}
className="btn-ghost mt-2"
>
{savingCandidatureGuidelines ? "Sauvegarde..." : "Sauvegarder texte candidature"}
</button>
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

<div className="mt-3">
<p className="text-sm font-semibold mb-1">Paramètres événement</p>
<textarea
className="input"
rows={3}
placeholder="Description de la date (infos techniques, ambiance, contraintes...)"
value={dateSettingsDrafts[d.id]?.description || ""}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
description: e.target.value,
},
}))
}
/>

<div className="grid gap-3 sm:grid-cols-2 mt-2">
<select
className="input"
value={dateSettingsDrafts[d.id]?.event_type || "concert"}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: applyEventTypePreset(current[d.id] || getDefaultSettingsDraft(), e.target.value as EventType),
}))
}
>
{EVENT_TYPE_OPTIONS.map((option) => (
<option key={option.value} value={option.value}>{option.label}</option>
))}
</select>

<input
className="input"
placeholder="Première partie (optionnel)"
value={dateSettingsDrafts[d.id]?.first_part_title || ""}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
first_part_title: e.target.value,
},
}))
}
/>

<input
className="input"
placeholder="Titre programmation (optionnel)"
value={dateSettingsDrafts[d.id]?.programmation_title || ""}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
programmation_title: e.target.value,
},
}))
}
/>

<input
className="input"
placeholder="Numero licence spectacle (optionnel)"
value={dateSettingsDrafts[d.id]?.spectacle_license || ""}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
spectacle_license: e.target.value,
},
}))
}
/>
</div>

<textarea
className="input"
rows={2}
placeholder="Texte programmation (jam session, infos sans groupe mis en avant...)"
value={dateSettingsDrafts[d.id]?.programmation_details || ""}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
programmation_details: e.target.value,
},
}))
}
/>

<div className="flex flex-col sm:flex-row gap-4 text-sm mt-2">
<label className="inline-flex items-center gap-2">
<input
type="checkbox"
checked={dateSettingsDrafts[d.id]?.show_on_programmation ?? true}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
show_on_programmation: e.target.checked,
},
}))
}
/>
Afficher en programmation publique
</label>

<label className="inline-flex items-center gap-2">
<input
type="checkbox"
checked={dateSettingsDrafts[d.id]?.highlight_group ?? true}
onChange={(e) =>
setDateSettingsDrafts((current) => ({
...current,
[d.id]: {
...(current[d.id] || getDefaultSettingsDraft()),
highlight_group: e.target.checked,
},
}))
}
/>
Groupe mis en avant
</label>
</div>

<button
onClick={() => void saveDateSettings(d.id)}
disabled={savingDateSettingsId === d.id}
className="btn-ghost mt-2"
>
{savingDateSettingsId === d.id ? "Sauvegarde..." : "Sauvegarder paramètres"}
</button>
</div>
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