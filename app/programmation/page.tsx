"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import FestivalHeader from "@/components/FestivalHeader";
import SocialIcon, { getSocialLinks } from "@/components/SocialIcon";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem, DateItem } from "@/lib/types";
import { generateICalCalendar, getCalendarLinks, downloadICalFile } from "@/lib/calendar";

type ProgramItem = {
  dateId: string;
  date: string;
  group: CandidatureItem;
};

export default function ProgrammationPage() {
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Créer un lien pour ajouter tous les événements au calendrier
  const getAllEventsCalendarOptions = () => {
    const firstDate = items[0]?.date || new Date().toISOString().split("T")[0];
    return getCalendarLinks({
      title: "Programmation - La Guinguette des Marmouz",
      description: `Tous les événements confirmés : ${items.map(item => `${item.group.nom_groupe} (${item.date})`).join(", ")}`,
      location: "La Guinguette des Marmouz, Plouër-sur-Rance",
      startDate: firstDate,
    });
  };

  const handleDownloadAllEvents = () => {
    const content = generateICalCalendar(
      items.map((item) => ({
        title: `${item.group.nom_groupe} - ${item.group.style_musical || "Concert"}`,
        description: item.group.bio || `Concert de ${item.group.nom_groupe}`,
        location: "La Guinguette des Marmouz, Plouër-sur-Rance",
        startDate: item.date,
        startTime: "20:00",
        endTime: "23:00",
      }))
    );
    downloadICalFile(content, "programmation-guinguette.ics");
  };

  const getEventUrl = (dateId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://laguinguettedesmarmouz.fr";
    return `${origin}/programmation/${dateId}`;
  };

  const getShareLinks = (item: ProgramItem) => {
    const eventUrl = getEventUrl(item.dateId);
    const shareText = `Découvrez ${item.group.nom_groupe} (${item.group.style_musical || "Concert"}) à La Guinguette des Marmouz : ${eventUrl}`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
    };
  };

  const copyEventLink = async (dateId: string) => {
    try {
      await navigator.clipboard.writeText(getEventUrl(dateId));
      setCopiedEventId(dateId);
      setTimeout(() => setCopiedEventId(null), 1500);
    } catch {
      setCopiedEventId(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);

    const { data: datesData } = await supabase
      .from("dates")
      .select("*")
      .eq("status", "confirmed")
      .order("date", { ascending: true });

    const confirmedDates = (datesData || []) as DateItem[];
    if (!confirmedDates.length) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ids = confirmedDates.map((d) => d.id);
    const { data: groupsData } = await supabase
      .from("candidatures")
      .select("*")
      .in("date_id", ids)
      .eq("status", "accepted");

    const groups = (groupsData || []) as CandidatureItem[];
    const byDate = new Map(groups.map((group) => [group.date_id, group]));

    const rows = confirmedDates
      .map((d) => ({ dateId: d.id, date: d.date, group: byDate.get(d.id) }))
      .filter((item): item is ProgramItem => Boolean(item.group));

    setItems(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      <FestivalHeader />

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title">Programmation</h2>
          {items.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <a
                href={getAllEventsCalendarOptions().google}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-festival text-xs sm:text-sm"
              >
                📅 Google
              </a>
              <a
                href={getAllEventsCalendarOptions().outlook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-festival text-xs sm:text-sm"
              >
                📅 Outlook
              </a>
              <button
                onClick={handleDownloadAllEvents}
                className="btn-festival text-xs sm:text-sm"
              >
                📅 iCal
              </button>
            </div>
          )}
        </div>
        <div className="space-y-6">
          {loading && <p className="text-[#2F5D50]">Chargement de la programmation...</p>}
          {!loading && items.length === 0 && (
            <article className="festival-card">
              <p>Aucune date confirmée pour l&apos;instant.</p>
            </article>
          )}
          {items.map((item) => (
            <article key={item.group.id} className="festival-card overflow-hidden">
              <Link href={`/programmation/${item.dateId}`}>
                <div className="grid gap-6 md:grid-cols-2 hover:opacity-90 transition-opacity">
                  {/* Info date & titre */}
                  <div>
                    <p className="text-sm uppercase tracking-wide text-[#1F2A44]/70 font-semibold text-[#D94A4A] mb-3">
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{item.group.nom_groupe}</h3>
                    <p className="text-lg text-[#1F2A44]/80 mt-2">{item.group.style_musical || "Style à confirmer"}</p>
                    {item.group.ville && <p className="text-[#1F2A44]/70 mt-1">📍 {item.group.ville}</p>}
                  </div>

                  {/* Photo du groupe */}
                  {item.group.photo_url ? (
                    <div className="rounded-lg overflow-hidden bg-gray-100 h-64 md:h-auto">
                      <img
                        src={item.group.photo_url}
                        alt={item.group.nom_groupe}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#F6C945]/30 to-[#D94A4A]/30 h-64 md:h-auto flex items-center justify-center">
                      <p className="text-[#1F2A44]/40">Photo à venir</p>
                    </div>
                  )}
                </div>
              </Link>

              {/* Bio & infos détaillées */}
              {(item.group.bio || item.group.reseaux) && (
                <div className="mt-6 pt-6 border-t border-[#1F2A44]/10">
                  {item.group.bio && (
                    <div className="mb-4">
                      <p className="font-semibold mb-2">À propos</p>
                      <p className="text-[#1F2A44]/80 line-clamp-3">{item.group.bio}</p>
                    </div>
                  )}

                  {item.group.reseaux && (
                    <div>
                      <p className="font-semibold mb-3">Réseaux sociaux</p>
                      <div className="flex flex-wrap gap-3">
                        {getSocialLinks(item.group.reseaux).map(({ url, platform, label }, idx) => {
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={label}
                              className="h-9 w-9 rounded-full border border-[#1F2A44]/15 flex items-center justify-center text-[#1F2A44] hover:text-[#D94A4A] hover:border-[#D94A4A] transition-colors"
                            >
                              <SocialIcon platform={platform} className="h-5 w-5" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons Partage */}
              <div className="mt-6 pt-6 border-t border-[#1F2A44]/10">
                <Link href={`/programmation/${item.dateId}`} className="btn-festival w-full text-center mb-3 block">
                  👀 Voir les détails
                </Link>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href={getShareLinks(item).whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-xl border border-[#1F2A44]/15 bg-white/70 px-3 py-2 text-center text-sm font-semibold text-[#1F2A44] hover:border-[#2F5D50] hover:text-[#2F5D50] transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={getShareLinks(item).facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-xl border border-[#1F2A44]/15 bg-white/70 px-3 py-2 text-center text-sm font-semibold text-[#1F2A44] hover:border-[#2F5D50] hover:text-[#2F5D50] transition-colors"
                  >
                    f Facebook
                  </a>
                  <a
                    href={getShareLinks(item).bluesky}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-xl border border-[#1F2A44]/15 bg-white/70 px-3 py-2 text-center text-sm font-semibold text-[#1F2A44] hover:border-[#2F5D50] hover:text-[#2F5D50] transition-colors"
                  >
                    🦋 Bluesky
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyEventLink(item.dateId);
                    }}
                    className="rounded-xl border border-[#1F2A44]/15 bg-white/70 px-3 py-2 text-center text-sm font-semibold text-[#1F2A44] hover:border-[#2F5D50] hover:text-[#2F5D50] transition-colors"
                  >
                    {copiedEventId === item.dateId ? "✅ Lien copié" : "🔗 Copier le lien"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
