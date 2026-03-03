import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Require admin password for security
const adminPassword = process.env.ADMIN_PASSWORD || ""

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 1. Define test dates (Saturdays only, 2026)
    const dates = [
      { date: "2026-04-04", status: "open" },
      { date: "2026-05-16", status: "open" },
      { date: "2026-06-06", status: "open" },
      { date: "2026-06-27", status: "open" },
      { date: "2026-07-04", status: "open" },
      { date: "2026-07-11", status: "open" },
      { date: "2026-07-25", status: "open" },
      { date: "2026-08-08", status: "open" },
      { date: "2026-08-22", status: "open" },
      { date: "2026-09-12", status: "open" },
      { date: "2026-09-26", status: "open" },
      { date: "2026-10-24", status: "open" },
    ]

    const testDateStrings = dates.map((d) => d.date)

    // 2. Delete existing test data (clean slate for re-running seed)
    const { data: existingDates } = await supabase
      .from("dates")
      .select("id")
      .in("date", testDateStrings)

    if (existingDates && existingDates.length > 0) {
      const existingIds = existingDates.map((d) => d.id)

      // Delete candidatures linked to these dates
      const { error: deleteCandError } = await supabase
        .from("candidatures")
        .delete()
        .in("date_id", existingIds)

      if (deleteCandError) {
        console.error("Error deleting old candidatures:", deleteCandError)
      }

      // Delete the old dates
      const { error: deleteDateError } = await supabase
        .from("dates")
        .delete()
        .in("id", existingIds)

      if (deleteDateError) {
        console.error("Error deleting old dates:", deleteDateError)
      }
    }

    // 3. Insert fresh test dates
    const { data: insertedDates, error: datesError } = await supabase
      .from("dates")
      .insert(dates)
      .select()

    if (datesError) {
      console.error("Error inserting dates:", datesError)
      return NextResponse.json({ error: datesError.message }, { status: 500 })
    }

    // 3. Prepare test groups
    const groups = [
      {
        nom_groupe: "Les Grooves du Mardi",
        style_musical: "Jazz Fusion",
        ville: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        membres: 3,
        contact: "Marc Dupont",
        email: "marc@grooves.fr",
        reseaux: "https://instagram.com/groovesdumardi",
        cachet: 400,
        logement: "oui",
        message: "Groupe passionné de jazz vraiment cool",
        photo_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        bio: "Les Grooves du Mardi joue depuis 2015. Nous mélangeons le jazz traditionnel avec des influences modernes. Très fun et dansant!",
        dateIndex: 0,
      },
      {
        nom_groupe: "Électro Seine",
        style_musical: "Électronique",
        ville: "Lyon",
        latitude: 45.764,
        longitude: 4.8357,
        membres: 2,
        contact: "Thomas Leclerc",
        email: "thomas@electroseine.fr",
        reseaux: "https://instagram.com/electroseine",
        cachet: 350,
        logement: "non",
        message: "Électro dynamique et hypnotisant",
        photo_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/jNQXAC9IVRw",
        bio: "Électro Seine crée une ambiance futuriste sur la base d'influences 80s. DJ/productrice + chanteuse live.",
        dateIndex: 1,
      },
      {
        nom_groupe: "Bretons Soul",
        style_musical: "Soul/Blues",
        ville: "Rennes",
        latitude: 48.1113,
        longitude: -1.68,
        membres: 3,
        contact: "Pierre Morvan",
        email: "pierre@bretonsouls.fr",
        reseaux: "https://instagram.com/bretonsouls",
        cachet: 300,
        logement: "oui",
        message: "Trio acoustique très cool",
        photo_url: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/ZbZSe6N_BXs",
        bio: "Bretons Soul réinterprète les grands standards du blues et soul avec une touche bretonne. Intimiste et chaleureux.",
        dateIndex: 2,
      },
      {
        nom_groupe: "Synth Route",
        style_musical: "Synthpop",
        ville: "Nantes",
        latitude: 47.2184,
        longitude: -1.5536,
        membres: 3,
        contact: "Adèle Girard",
        email: "adele@synthroute.fr",
        reseaux: "https://instagram.com/synthroute",
        cachet: 500,
        logement: "oui",
        message: "Synthpop des années 80 revisité",
        photo_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        bio: "Synth Route fabrique des murs de synthétiseurs contagieux avec des mélodies addictives et une nostalgie moderne.",
        dateIndex: 3,
      },
      {
        nom_groupe: "Folk Rance",
        style_musical: "Musique Traditionnelle",
        ville: "Saint-Malo",
        latitude: 48.6504,
        longitude: -2.0268,
        membres: 3,
        contact: "Gwenn Le Bihan",
        email: "gwenn@folkrance.fr",
        reseaux: "https://instagram.com/folkrance",
        cachet: 250,
        logement: "non",
        message: "Musique bretonne authentique",
        photo_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/ZbZSe6N_BXs",
        bio: "Folk Rance honore les traditions musicales bretonnes avec fidélité. Danses folkloriques garanties!",
        dateIndex: 4,
      },
      {
        nom_groupe: "Reggae Liberation",
        style_musical: "Reggae/Ska",
        ville: "Bordeaux",
        latitude: 44.8378,
        longitude: -0.5792,
        membres: 3,
        contact: "Marcus Williams",
        email: "marcus@reggaeliberation.fr",
        reseaux: "https://instagram.com/reggaeliberation",
        cachet: 400,
        logement: "oui",
        message: "Bon vibes et rythmes reggae",
        photo_url: "https://images.unsplash.com/photo-1488515959476-eb92d76fb0b5?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/jNQXAC9IVRw",
        bio: "Reggae Liberation apporte les bonnes vibrations caribéennes. Groove hypnotique et messages positifs.",
        dateIndex: 5,
      },
      {
        nom_groupe: "Punk Mammouth",
        style_musical: "Punk/Garage",
        ville: "Angers",
        latitude: 47.4711,
        longitude: -0.5541,
        membres: 3,
        contact: "Thierry Bonhomme",
        email: "thierry@punkmammouth.fr",
        reseaux: "https://instagram.com/punkmammouth",
        cachet: 200,
        logement: "non",
        message: "Punk énergie brute",
        photo_url: "https://images.unsplash.com/photo-1498038432885-27910b7a64a4?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        bio: "Punk Mammouth joue du garage punk brut, sans compromis. Énergie explosive et anarchie musicale!",
        dateIndex: 6,
      },
      {
        nom_groupe: "Ambient Ocean",
        style_musical: "Ambient/Électronique",
        ville: "Quimper",
        latitude: 47.9958,
        longitude: -4.0941,
        membres: 2,
        contact: "Sophie Tanguy",
        email: "sophie@ambientocean.fr",
        reseaux: "https://instagram.com/ambientocean",
        cachet: 300,
        logement: "oui",
        message: "Sonorités immersives inspirées de l'océan",
        photo_url: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/ZbZSe6N_BXs",
        bio: "Ambient Ocean crée des paysages sonores méditative inspirés par la nature bretonne et l'océan Atlantique.",
        dateIndex: 7,
      },
      {
        nom_groupe: "Fiddle Groove",
        style_musical: "Musique Celtique/Contemporain",
        ville: "Vannes",
        latitude: 47.6426,
        longitude: -2.759,
        membres: 2,
        contact: "Lola Rousseau",
        email: "lola@fiddlegroove.fr",
        reseaux: "https://instagram.com/fiddlegroove",
        cachet: 350,
        logement: "oui",
        message: "Violon celtique sur grooves modernes",
        photo_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/jNQXAC9IVRw",
        bio: "Fiddle Groove fusionne le violon celtique avec des grooves funk et rock contemporains. Surprenant et dansant.",
        dateIndex: 8,
      },
      {
        nom_groupe: "Trip Hop Breizh",
        style_musical: "Trip Hop",
        ville: "Lorient",
        latitude: 47.7497,
        longitude: -3.3621,
        membres: 2,
        contact: "Laurent Blanchard",
        email: "laurent@triphopreizh.fr",
        reseaux: "https://instagram.com/triphopreizh",
        cachet: 450,
        logement: "oui",
        message: "Trip hop sombre et atmosphérique",
        photo_url: "https://images.unsplash.com/photo-1514615592292-93cfe1aed534?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        bio: "Trip Hop Breizh offre une atmosphère sombre et hypnotique. Grooves lents avec voix mystérieuse.",
        dateIndex: 9,
      },
      {
        nom_groupe: "Chanson Nouvelle",
        style_musical: "Chanson Française",
        ville: "Brest",
        latitude: 48.3905,
        longitude: -4.486,
        membres: 2,
        contact: "Bertrand Fabre",
        email: "bertrand@chansonnouv.fr",
        reseaux: "https://instagram.com/chansonnouv",
        cachet: 250,
        logement: "non",
        message: "Chansons introspectives et poétiques",
        photo_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=left",
        video_url: "https://www.youtube.com/embed/ZbZSe6N_BXs",
        bio: "Chanson Nouvelle reprend le tradition française avec des textes poétiques et arrangements acoustiques intimistes.",
        dateIndex: 10,
      },
      {
        nom_groupe: "Metal Occult",
        style_musical: "Metal/Hardcore",
        ville: "Dinan",
        latitude: 48.4662,
        longitude: -2.0465,
        membres: 3,
        contact: "Romain Black",
        email: "romain@metaloccult.fr",
        reseaux: "https://instagram.com/metaloccult",
        cachet: 300,
        logement: "oui",
        message: "Metal heavy et ambiance apocalyptique",
        photo_url: "https://images.unsplash.com/photo-1496182191671-a8522ff77d4d?w=800&h=600&fit=crop",
        video_url: "https://www.youtube.com/embed/jNQXAC9IVRw",
        bio: "Metal Occult crée une ambiance heavy avec des riffs épiques et une production atmosphérique sombre.",
        dateIndex: 11,
      },
    ]

    // 4. Insert candidatures with "accepted" status (confirmed groups)
    const candidatures = groups.map((group) => ({
      date_id: insertedDates?.[group.dateIndex]?.id || null,
      nom_groupe: group.nom_groupe,
      style_musical: group.style_musical,
      ville: group.ville,
      latitude: group.latitude,
      longitude: group.longitude,
      membres: Number(group.membres),
      contact: group.contact,
      email: group.email,
      reseaux: group.reseaux,
      cachet: Number(group.cachet),
      logement: group.logement,
      message: group.message,
      status: "accepted",
      photo_url: group.photo_url,
      video_url: group.video_url,
      bio: group.bio,
    }))

    const { error: candidaturesError } = await supabase
      .from("candidatures")
      .insert(candidatures)

    if (candidaturesError) {
      console.error("Error inserting candidatures:", candidaturesError)
      console.error("Candidatures data:", JSON.stringify(candidatures[0], null, 2))
      return NextResponse.json(
        { error: `Failed to insert candidatures: ${candidaturesError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedDates?.length || 0} dates and ${candidatures.length} groups`,
      datesCount: insertedDates?.length,
      groupsCount: candidatures.length,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
