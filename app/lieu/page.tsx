"use client";

import FestivalHeader from "@/components/FestivalHeader";

export default function LieuPage() {
  // Pour le calendrier
  const venueUrl = "https://www.laguinguettedesmarmouz.fr";
  const venueName = "La Guinguette des Marmouz";
  const venueAddress = "Plouër-sur-Rance, 22490 Côtes-d'Armor, Bretagne";
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
        <div className="festival-card bg-white text-[#1F2A44]">
          <h1 className="text-3xl font-bold mb-4">La Guinguette des Marmouz</h1>
          <p className="text-[#1F2A44] mb-4">
            Bar musical et guinguette familiale sur les bords de la Rance, à Plouër-sur-Rance (Côtes-d'Armor).
            Un lieu chaleureux, ouvert à tous, où la musique reste un plaisir partagé.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-wide text-[#1F2A44]/80">Adresse</p>
              <p className="mt-1 font-semibold">Plouër-sur-Rance</p>
              <p className="text-[#1F2A44]">22490 Côtes-d'Armor, Bretagne</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-[#1F2A44]/80">Contact</p>
              <p className="mt-1">
                <a href="tel:0257690290" className="font-semibold hover:text-[#D94A4A]">
                  {venuePhone}
                </a>
              </p>
              <p className="text-[#1F2A44]">
                <a
                  href={venueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D94A4A]"
                >
                  www.laguinguettedesmarmouz.fr
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Ambiance */}
        <div className="festival-card bg-white text-[#1F2A44]">
          <h2 className="text-2xl font-bold mb-3">Ambiance</h2>
          <p className="text-[#1F2A44]">
            La Guinguette des Marmouz est un lieu de vie musicale convivial, avec une vraie ambiance familiale.
            On y accueille des concerts et des jam sessions dans un esprit simple: se retrouver, découvrir, et passer un bon moment.
          </p>
          <p className="text-[#1F2A44] mt-3">
            Côté styles, la programmation est volontairement variée: reggae, funk, rock, chanson, musiques du monde,
            folk, hip-hop, groove, acoustique, blues, soul, pop et bien d'autres selon les soirées.
          </p>
           <p className="text-[#1F2A44] mt-3">
            Le site étant situé dans une vallée, le son peut porter: tout est donc encadré pour limiter les nuisances.
            Sonorisation maîtrisée, volumes contrôlés et fin des concerts généralement à 22h (avec quelques dates à 23h).
            Dans cette logique, nous évitons les percussions et tout instrument qui dépasse le volume sonore autorisé,
            ou qui ne peut pas être baissé correctement. Notre priorité est claire: proposer une belle expérience musicale
            tout en respectant pleinement les riverains.
          </p>
        </div>

        {/* Infos pratiques */}
        <div className="festival-card bg-white text-[#1F2A44]">
          <h2 className="text-2xl font-bold mb-4">Infos pratiques</h2>
          <div className="grid gap-3">
            <div>
              <p className="font-semibold">🕐 Horaires</p>
              <p className="text-[#1F2A44]">Les concerts commencent en général vers 19h30/20h, avec une fin le plus souvent à 22h (quelques dates à 23h).</p>
            </div>
            <div>
              <p className="font-semibold">🍽️ Air & ambiance</p>
              <p className="text-[#1F2A44]">Bar, terrasse, le tout en plein air et ambiance familiale.</p>
            </div>
            <div>
              <p className="font-semibold">🎤 Programmation</p>
              <p className="text-[#1F2A44]">Concerts live, jam sessions et programmation éclectique.</p>
            </div>
            <div>
              <p className="font-semibold">📍 Localisation</p>
              <p className="text-[#1F2A44]">Rive gauche de la Rance, accès facile en voiture et à pied depuis le bourg</p>
            </div>
          </div>
        </div>

        {/* Réseaux */}
        <div className="festival-card bg-white text-[#1F2A44]">
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
