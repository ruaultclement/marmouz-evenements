"use client"

import {useState} from "react"
import { useParams } from "next/navigation"
import {supabase} from "@/lib/supabase"
import Link from "next/link"

type GeoPoint = {
lat: number
lon: number
}

async function geocodeCity(city: string): Promise<GeoPoint | null> {
if (!city) return null

try {
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 3000)

const response = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&q=${encodeURIComponent(city)}`,
{ signal: controller.signal }
)

clearTimeout(timeout)

if (!response.ok) return null

const results = (await response.json()) as Array<{ lat: string; lon: string }>
if (!results.length) return null

return {
lat: Number(results[0].lat),
lon: Number(results[0].lon),
}
} catch (error) {
console.log("Géolocalisation échouée (non-bloquant):", error)
return null
}
}

export default function Page(){

const params = useParams()
const dateId = params.id as string

const[nom,setNom]=useState("")
const [styleMusical, setStyleMusical] = useState("")
const [ville, setVille] = useState("")
const [membres, setMembres] = useState("")
const[email,setEmail]=useState("")
const[contact,setContact]=useState("")
const [facebook, setFacebook] = useState("")
const [instagram, setInstagram] = useState("")
const [youtube, setYoutube] = useState("")
const [spotify, setSpotify] = useState("")
const [tiktok, setTiktok] = useState("")
const [website, setWebsite] = useState("")
const[cachet,setCachet]=useState("")
const[logement,setLogement]=useState("")
const[message,setMessage]=useState("")
const [sending, setSending] = useState(false)
const [feedback, setFeedback] = useState<string | null>(null)

async function envoyer(){

if (!nom.trim() || !email.trim() || !contact.trim()) {
setFeedback("Le nom du groupe, l'email et le téléphone sont obligatoires.")
return
}

setSending(true)
setFeedback(null)

let lat: number | null = null
let lon: number | null = null

if (ville.trim()) {
const geoPoint = await geocodeCity(ville)
if (geoPoint) {
lat = geoPoint.lat
lon = geoPoint.lon
}
}

const { error } = await supabase
.from("candidatures")
.insert({

date_id:dateId,
nom_groupe:nom.trim(),
style_musical:styleMusical.trim() || null,
ville:ville.trim() || null,
latitude:lat,
longitude:lon,
membres:membres ? Number(membres) : null,
email:email.trim(),
contact:contact.trim(),
reseaux: [facebook.trim(), instagram.trim(), youtube.trim(), spotify.trim(), tiktok.trim(), website.trim()].filter(Boolean).join(", ") || null,
cachet:cachet.trim() || null,
logement:logement.trim() || null,
message:message.trim() || null,
status:"pending"

})

if (error) {
console.error("Erreur Supabase:", error)
setFeedback("Erreur lors de l'envoi : " + (error?.message || "Réessaye plus tard"))
setSending(false)
return
}

// Send notification email to admin
try {
await fetch("/api/notify-candidature", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
nom_groupe: nom.trim(),
style_musical: styleMusical.trim(),
email: email.trim(),
contact: contact.trim(),
ville: ville.trim(),
membres: membres ? Number(membres) : null,
reseaux: [facebook.trim(), instagram.trim(), youtube.trim(), spotify.trim(), tiktok.trim(), website.trim()].filter(Boolean).join(", "),
cachet: cachet.trim(),
logement: logement.trim(),
message: message.trim(),
}),
})
} catch (err) {
console.log("Notification email non envoyée (non-bloquant):", err)
}

setNom("")
setStyleMusical("")
setVille("")
setMembres("")
setEmail("")
setContact("")
setFacebook("")
setInstagram("")
setYoutube("")
setSpotify("")
setTiktok("")
setWebsite("")
setCachet("")
setLogement("")
setMessage("")
setFeedback("✅ Candidature envoyée avec succès ! On te recontacte bientôt.")
setSending(false)

}

return(

<main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

<Link href="/" className="btn-ghost inline-flex mb-6">← Retour aux dates</Link>

<div className="festival-card">

<h1 className="text-3xl mb-6">

Proposer votre groupe

</h1>

{feedback && <p className={`mb-4 p-3 rounded text-sm ${feedback.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{feedback}</p>}

<div className="space-y-3">

<input className="input" placeholder="Nom du groupe *"
value={nom}
onChange={(e)=>setNom(e.target.value)}/>

<input className="input" placeholder="Email *"
type="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}/>

<input className="input" placeholder="Téléphone *"
value={contact}
onChange={(e)=>setContact(e.target.value)}/>

<input className="input" placeholder="Style musical"
value={styleMusical}
onChange={(e)=>setStyleMusical(e.target.value)}/>

<input className="input" placeholder="Ville"
value={ville}
onChange={(e)=>setVille(e.target.value)}/>

<input className="input" placeholder="Nombre d'artistes"
type="number"
min={1}
value={membres}
onChange={(e)=>setMembres(e.target.value)}/>

{/* Réseaux Sociaux */}
<div className="space-y-2">
	<label className="text-sm font-semibold text-[#1F2A44]">Réseaux sociaux (optionnel)</label>
	<input className="input" placeholder="Facebook: https://facebook.com/..."
		value={facebook}
		onChange={(e)=>setFacebook(e.target.value)}/>
	<input className="input" placeholder="Instagram: https://instagram.com/..."
		value={instagram}
		onChange={(e)=>setInstagram(e.target.value)}/>
	<input className="input" placeholder="YouTube: https://youtube.com/..."
		value={youtube}
		onChange={(e)=>setYoutube(e.target.value)}/>
	<input className="input" placeholder="Spotify: https://open.spotify.com/..."
		value={spotify}
		onChange={(e)=>setSpotify(e.target.value)}/>
	<input className="input" placeholder="TikTok: https://tiktok.com/..."
		value={tiktok}
		onChange={(e)=>setTiktok(e.target.value)}/>
	<input className="input" placeholder="Site web ou autre lien"
		value={website}
		onChange={(e)=>setWebsite(e.target.value)}/>
</div>

<input className="input" placeholder="Cachet demandé"
value={cachet}
onChange={(e)=>setCachet(e.target.value)}/>

<input className="input" placeholder="Besoin logement"
value={logement}
onChange={(e)=>setLogement(e.target.value)}/>

<textarea className="input" placeholder="Message libre" rows={4}
value={message}
onChange={(e)=>setMessage(e.target.value)}/>

</div>

<button
onClick={envoyer}
disabled={sending}
className="btn-festival mt-6 w-full sm:w-auto">

{sending ? "Envoi en cours..." : "Envoyer candidature"}

</button>

<p className="text-sm text-[#1F2A44]/60 mt-4">
Les champs avec * sont obligatoires. On te recontacte rapidement.
</p>

</div>

</main>

)

}