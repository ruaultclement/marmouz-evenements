"use client"

import {useCallback,useEffect,useState} from "react"
import {supabase} from "@/lib/supabase"
import DateCard from "@/components/DateCard"
import FestivalHeader from "@/components/FestivalHeader"
import type { DateItem } from "@/lib/types"

export default function Home(){

const[dates,setDates]=useState<DateItem[]>([])
const [loading, setLoading] = useState(true)
const [errorMessage, setErrorMessage] = useState<string | null>(null)

const loadDates = useCallback(async () => {

setLoading(true)
setErrorMessage(null)

const {data, error}=await supabase
.from("dates")
.select("*")
.eq("status","open")
.order("date")

if (error) {
setErrorMessage("Impossible de charger les dates pour le moment.")
setDates([])
setLoading(false)
return
}

setDates(data || [])
setLoading(false)

}, [])

useEffect(()=>{

const timer = setTimeout(() => {
void loadDates()
}, 0)

return () => clearTimeout(timer)

},[loadDates])

return(

<main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

<FestivalHeader/>

<section className="mb-10">
<div className="festival-card">
<p className="text-lg text-[#1F2A44] italic">
Trouves la date qui te plaît, puis fais découvrir ton groupe à La Guinguette.
</p>
</div>
</section>

<section className="mb-12">
<h2 className="section-title">Dates ouvertes</h2>

{loading && (
<p className="text-center text-[#2F5D50]">Chargement des dates...</p>
)}

{errorMessage && (
<p className="text-center text-[#D94A4A]">{errorMessage}</p>
)}

{!loading && !errorMessage && dates.length === 0 && (
<p className="text-center text-[#2F5D50]">Aucune date ouverte pour le moment.</p>
)}

{dates.map(d=>(
<DateCard key={d.id} id={d.id} date={d.date}/>
))}

</section>

</main>

)

}