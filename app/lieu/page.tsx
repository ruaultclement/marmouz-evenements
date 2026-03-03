"use client";

import FestivalHeader from "@/components/FestivalHeader";

export default function LieuPage() {
  // Pour le calendrier
  const venueUrl = "https://www.laguinguettedesmarmouz.fr";
  const venueName = "La Guinguette des Marmouz";
  const venueAddress = "Plouër-sur-Rance, 22160 Côtes-d'Armor, Bretagne";
  const venuePhone = "02 57 69 02 90";

  // Créer un lien Google Calendar avec rappels
  const createCalendarUrl = () => {
    const title = encodeURIComponent(venueName);
    const description = encodeURIComponent("Découvrez la programmation musicale de La Guinguette des Marmouz");
    const location = encodeURIComponent(venueAddress);
    
    // Lien Google Calendar (sans date spécifique, utilisateur ajoute manuellement)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}`;
  };

  // Boutons de partage
  const shareLinks = {
    whatsapp: `https://wa.me/?text=Découvrez La Guinguette des Marmouz! ${venueUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(venueUrl)}`,
    instagram: "https://www.instagram.com/guinguette.marmouz/",
    bluesky: "https://bsky.app/",
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      <FestivalHeader />

      <div className="grid gap-6 mb-8">
        {/* Infos principales */}
        <div className="festival-card">
          <h1 className="text-3xl font-bold mb-4">La Guinguette des Marmouz</h1>
          <p className="text-[#1F2A44]/80 mb-4">
            Bar musical & guinguette festive sur les rives de la Rance, à Plouër-sur-Rance (Côtes-d'Armor)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-wide text-[#1F2A44]/60">Adresse</p>
              <p className="mt-1 font-semibold">Plouër-sur-Rance</p>
              <p className="text-[#1F2A44]/80">22160 Côtes-d'Armor, Bretagne</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-[#1F2A44]/60">Contact</p>
              <p className="mt-1">
                <a href="tel:0257690290" className="font-semibold hover:text-[#D94A4A]">
                  {venuePhone}
                </a>
              </p>
              <p className="text-[#1F2A44]/80">
                <a
                  href={venueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D94A4A]"
                >
                  laguinguettedesmarmouz.fr
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Ambiance */}
        <div className="festival-card">
          <h2 className="text-2xl font-bold mb-3">Ambiance</h2>
          <p className="text-[#1F2A44]/80">
            La Guinguette des Marmouz est un lieu de vie musicale au bord de l'eau. Entre concert, jam session 
            et convivialité, c'est l'endroit idéal pour découvrir des artistes régionaux et internationaux dans une ambiance 
            festive et familiale.
          </p>
          <p className="text-[#1F2A44]/80 mt-3">
            Reggae, funk, électro, world music... tous les styles y trouvent leurs marques pour une programmation 
            riche et éclectique.
          </p>
        </div>

        {/* Infos pratiques */}
        <div className="festival-card">
          <h2 className="text-2xl font-bold mb-4">Infos pratiques</h2>
          <div className="grid gap-3">
            <div>
              <p className="font-semibold">🕐 Horaires</p>
              <p className="text-[#1F2A44]/80">Variable selon programmation (consulter le site)</p>
            </div>
            <div>
              <p className="font-semibold">🍽️ Air & ambiance</p>
              <p className="text-[#1F2A44]/80">Bar, terrasse, vue sur la Rance</p>
            </div>
            <div>
              <p className="font-semibold">🎤 Programmation</p>
              <p className="text-[#1F2A44]/80">Concerts, jam sessions, soirées dansantes</p>
            </div>
            <div>
              <p className="font-semibold">📍 Localisation</p>
              <p className="text-[#1F2A44]/80">Rive gauche de la Rance, accès facile en voiture et à pied depuis le bourg</p>
            </div>
          </div>
        </div>

        {/* Réseaux */}
        <div className="festival-card">
          <h2 className="text-2xl font-bold mb-3">Suivre l'actu</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.facebook.com/laguinguettedesmarmouz/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-festival"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/guinguette.marmouz/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
