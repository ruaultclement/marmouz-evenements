"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FestivalHeader from "@/components/FestivalHeader";
import SocialIcon, { getSocialLinks } from "@/components/SocialIcon";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem, DateItem } from "@/lib/types";
import { generateICalCalendar, getCalendarLinks, downloadICalFile } from "@/lib/calendar";

type ProgramGroupItem = {
  kind: "group";
  dateId: string;
  date: string;
  dateInfo: DateItem;
  group: CandidatureItem;
};

type ProgramDateOnlyItem = {
  kind: "date_only";
  dateId: string;
  date: string;
  dateInfo: DateItem;
};

type ProgramItem = ProgramGroupItem | ProgramDateOnlyItem;

function defaultEventTitle(item: DateItem) {
  if (item.event_type === "jam_session") return "Jam session";
  if (item.event_type === "soiree_thematique") return "Soirée thématique";
  if (item.event_type === "autre") return "Événement spécial";
  return "Concert";
}

function eventCardTitle(item: DateItem) {
  return item.programmation_title || defaultEventTitle(item);
}

function ProgrammationPageContent() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  const notifyEmbedHeight = useCallback(() => {
    if (!isEmbed || typeof window === "undefined" || window.parent === window) {
      return;
    }

    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );

    window.parent.postMessage(
      {
        type: "marmouz-programmation-height",
        height,
      },
      "*"
    );
  }, [isEmbed]);

  // Créer un lien pour ajouter tous les événements au calendrier
  const getAllEventsCalendarOptions = () => {
    const firstDate = items[0]?.date || new Date().toISOString().split("T")[0];
    return getCalendarLinks({
      title: "Programmation - La Guinguette des Marmouz",
      description: `Tous les événements confirmés : ${items.map(item => `${item.kind === "group" ? item.group.nom_groupe : eventCardTitle(item.dateInfo)} (${item.date})`).join(", ")}`,
      location: "La Guinguette des Marmouz, Plouër-sur-Rance",
      startDate: firstDate,
    });
  };

  const handleDownloadAllEvents = () => {
    const content = generateICalCalendar(
      items.map((item) => ({
        title:
          item.kind === "group"
            ? `${item.group.nom_groupe} - ${item.group.style_musical || "Concert"}`
            : eventCardTitle(item.dateInfo),
        description:
          item.kind === "group"
            ? item.group.bio || `Concert de ${item.group.nom_groupe}`
            : item.dateInfo.programmation_details || item.dateInfo.description || "Événement à la Guinguette",
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
    return `${origin}/programmation/${dateId}${isEmbed ? "?embed=1" : ""}`;
  };

  const getShareLinks = (item: ProgramItem) => {
    const eventUrl = getEventUrl(item.dateId);
    const shareLabel = item.kind === "group" ? item.group.nom_groupe : eventCardTitle(item.dateInfo);
    const shareText = `Découvrez ${shareLabel} à La Guinguette des Marmouz : ${eventUrl}`;

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
      .filter((d) => d.show_on_programmation !== false)
      .map((d): ProgramItem | null => {
        const shouldHighlightGroup = d.highlight_group !== false && d.event_type !== "jam_session";
        const group = byDate.get(d.id);

        if (shouldHighlightGroup && group) {
          return { kind: "group", dateId: d.id, date: d.date, dateInfo: d, group };
        }

        return { kind: "date_only", dateId: d.id, date: d.date, dateInfo: d };
      })
      .filter((item): item is ProgramItem => Boolean(item));

    setItems(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!isEmbed || typeof window === "undefined") {
      return;
    }

    notifyEmbedHeight();
    const resizeObserver = new ResizeObserver(() => notifyEmbedHeight());
    resizeObserver.observe(document.body);

    window.addEventListener("resize", notifyEmbedHeight);
    const delayedTick = window.setTimeout(notifyEmbedHeight, 300);

    return () => {
      window.clearTimeout(delayedTick);
      window.removeEventListener("resize", notifyEmbedHeight);
      resizeObserver.disconnect();
    };
  }, [isEmbed, loading, items.length, notifyEmbedHeight]);

  return (
    <main className={`${isEmbed ? "max-w-none" : "max-w-5xl mx-auto"} px-4 sm:px-6 pb-16`}>
      {!isEmbed && <FestivalHeader />}

      <section className="mb-10 mt-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <h2 className="section-title">Programmation</h2>
          <a
            href="https://booking.laguinguettedesmarmouz.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-festival"
          >
            Viens te produire à la Guinguette
          </a>
          {items.length > 0 && !isEmbed && (
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
            <article key={item.dateId} className="festival-card overflow-hidden">
              <Link href={`/programmation/${item.dateId}${isEmbed ? "?embed=1" : ""}`}>
                <div className="grid gap-6 md:grid-cols-2 hover:opacity-90 transition-opacity">
                  {/* Info date & titre */}
                  <div>
                    <p className="text-sm uppercase tracking-wide font-semibold text-[#D94A4A] mb-3">
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                      {item.kind === "group" ? item.group.nom_groupe : eventCardTitle(item.dateInfo)}
                    </h3>
                    <p className="text-lg text-[#1F2A44]/80 mt-2">
                      {item.kind === "group"
                        ? item.group.style_musical || "Style à confirmer"
                        : item.dateInfo.first_part_title
                        ? `Avec première partie : ${item.dateInfo.first_part_title}`
                        : defaultEventTitle(item.dateInfo)}
                    </p>
                    {item.kind === "group" && item.group.ville && <p className="text-[#1F2A44]/70 mt-1">📍 {item.group.ville}</p>}
                    {item.kind === "date_only" && item.dateInfo.programmation_details && (
                      <p className="text-[#1F2A44]/80 mt-3 whitespace-pre-wrap">{item.dateInfo.programmation_details}</p>
                    )}
                    {item.dateInfo.spectacle_license && (
                      <p className="text-xs text-[#1F2A44]/60 mt-3">Licence spectacle: {item.dateInfo.spectacle_license}</p>
                    )}
                  </div>

                  {/* Photo du groupe */}
                  {item.kind === "group" && item.group.photo_url ? (
                    <div className="rounded-lg overflow-hidden bg-gray-100 h-64 md:h-auto">
                      <img
                        src={item.group.photo_url}
                        alt={item.group.nom_groupe}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden bg-linear-to-br from-[#F6C945]/30 to-[#D94A4A]/30 h-64 md:h-auto flex items-center justify-center">
                      <p className="text-[#1F2A44]/40">Photo à venir</p>
                    </div>
                  )}
                </div>
              </Link>

              {/* Bio & infos détaillées */}
              {item.kind === "group" && (item.group.bio || item.group.reseaux) && (
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
              {!isEmbed && (
                <div className="mt-6 pt-6 border-t border-[#1F2A44]/10">
                  <Link href={`/programmation/${item.dateId}${isEmbed ? "?embed=1" : ""}`} className="btn-festival w-full text-center mb-3 block">
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
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function ProgrammationPage() {
  return (
    <Suspense fallback={<main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16"><p className="text-[#2F5D50] mt-10">Chargement de la programmation...</p></main>}>
      <ProgrammationPageContent />
    </Suspense>
  );
}
