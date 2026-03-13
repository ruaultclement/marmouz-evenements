"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import FestivalHeader from "@/components/FestivalHeader";
import SocialIcon, { getSocialLinks } from "@/components/SocialIcon";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem, DateItem } from "@/lib/types";

type EventDetails = {
  date: DateItem;
  group: CandidatureItem | null;
};

function defaultEventTitle(item: DateItem) {
  if (item.event_type === "jam_session") return "Jam session";
  if (item.event_type === "soiree_thematique") return "Soirée thématique";
  if (item.event_type === "autre") return "Événement spécial";
  return "Concert";
}

function EventDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  const showShare = searchParams.get("share") === "1";
  const dateId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const copyEventLink = async () => {
    try {
      const eventUrl = typeof window !== "undefined" ? window.location.href : `https://laguinguettedesmarmouz.fr/programmation/${dateId}`;
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const getShareLinks = (label: string) => {
    const eventUrl = typeof window !== "undefined" ? window.location.href : `https://laguinguettedesmarmouz.fr/programmation/${dateId}`;
    const shareText = `Découvrez ${label} à La Guinguette des Marmouz : ${eventUrl}`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
    };
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: dateData, error: dateError } = await supabase
      .from("dates")
      .select("*")
      .eq("id", dateId)
      .single();

    if (dateError || !dateData) {
      setError("Événement non trouvé");
      setLoading(false);
      return;
    }

    const dateItem = dateData as DateItem;

    const { data: groupData } = await supabase
      .from("candidatures")
      .select("*")
      .eq("date_id", dateId)
      .eq("status", "accepted")
      .maybeSingle();

    const shouldHighlightGroup = dateItem.highlight_group !== false && dateItem.event_type !== "jam_session";
    setEvent({ date: dateItem, group: shouldHighlightGroup ? (groupData as CandidatureItem | null) : null });
    setLoading(false);
  }, [dateId]);

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
  }, [isEmbed, loading, Boolean(event), notifyEmbedHeight]);

  if (loading) {
    return (
      <main className={`${isEmbed ? "max-w-none" : "max-w-5xl mx-auto"} px-4 sm:px-6 pb-16`}>
        {!isEmbed && <FestivalHeader />}
        <p className="text-[#2F5D50] mt-10">Chargement de l&apos;événement...</p>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className={`${isEmbed ? "max-w-none" : "max-w-5xl mx-auto"} px-4 sm:px-6 pb-16`}>
        {!isEmbed && <FestivalHeader />}
        <Link href={`/programmation${isEmbed ? "?embed=1" : ""}`} className="btn-ghost inline-flex mt-6 mb-6">
          ← Retour à la programmation
        </Link>
        <div className="festival-card text-center">
          <p className="text-[#D94A4A] font-semibold">{error || "Événement non disponible"}</p>
        </div>
      </main>
    );
  }

  const { date, group } = event;
  const title = group?.nom_groupe || date.programmation_title || defaultEventTitle(date);
  const subtitle = group?.style_musical || (date.first_part_title ? `Avec première partie : ${date.first_part_title}` : defaultEventTitle(date));
  const bodyText = group?.bio || date.programmation_details || date.description || "Informations à venir";
  const eventDate = new Date(`${date.date}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className={`${isEmbed ? "max-w-none" : "max-w-5xl mx-auto"} px-4 sm:px-6 pb-16`}>
      {!isEmbed && <FestivalHeader />}

      {!isEmbed && (
        <Link href={`/programmation${isEmbed ? `?embed=1${showShare ? "&share=1" : ""}` : ""}`} className="btn-ghost inline-flex mb-6 mt-6">
          ← Retour à la programmation
        </Link>
      )}

      {group?.photo_url ? (
        <div className="rounded-xl overflow-hidden mb-8 h-96 md:h-125 bg-gray-100">
          <img src={group.photo_url} alt={group.nom_groupe} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden mb-8 h-96 md:h-125 bg-linear-to-br from-[#F6C945]/30 to-[#D94A4A]/30 flex items-center justify-center">
          <p className="text-[#1F2A44]/40 text-lg">Visuel événement</p>
        </div>
      )}

      <section className="mb-10">
        <div className="festival-card">
          <p className="text-sm uppercase tracking-wide text-[#D94A4A] font-semibold mb-3">{eventDate}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
          <p className="text-xl text-[#1F2A44]/80 mb-2">{subtitle}</p>
          {group?.ville && <p className="text-[#1F2A44]/70">📍 {group.ville}</p>}
          {date.spectacle_license && <p className="text-xs text-[#1F2A44]/60 mt-3">Licence spectacle: {date.spectacle_license}</p>}
        </div>
      </section>

      <section className="mb-10">
        <div className="festival-card">
          <h2 className="section-title mb-4">À propos de l&apos;événement</h2>
          <p className="text-lg text-[#1F2A44]/80 leading-relaxed whitespace-pre-wrap">{bodyText}</p>

          {group?.reseaux && (
            <div className="mt-6">
              <p className="font-semibold text-[#1F2A44] mb-3">Réseaux du groupe</p>
              <div className="flex flex-wrap gap-3">
                {getSocialLinks(group.reseaux).map(({ url, platform, label }, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="h-10 w-10 rounded-full border border-[#1F2A44]/15 flex items-center justify-center text-[#1F2A44] hover:text-[#D94A4A] hover:border-[#D94A4A] transition-colors"
                  >
                    <SocialIcon platform={platform} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {(!isEmbed || showShare) && <section className="mb-10">
        <div className="festival-card p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1F2A44]/70 uppercase tracking-wide">Partager</p>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              <a
                href={getShareLinks(title).whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                title="Partager sur WhatsApp"
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                💬
              </a>
              <a
                href={getShareLinks(title).facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Partager sur Facebook"
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                f
              </a>
              <a
                href={getShareLinks(title).bluesky}
                target="_blank"
                rel="noopener noreferrer"
                title="Partager sur Bluesky"
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                🦋
              </a>
              <button
                onClick={() => void copyEventLink()}
                title={copied ? "Lien copie" : "Copier le lien"}
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                {copied ? "✅" : "🔗"}
              </button>
            </div>
          </div>
        </div>
      </section>}
    </main>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16"><p className="text-[#2F5D50] mt-10">Chargement de l&apos;événement...</p></main>}>
      <EventDetailPageContent />
    </Suspense>
  );
}
