"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FestivalHeader from "@/components/FestivalHeader";
import SocialIcon, { getSocialLinks } from "@/components/SocialIcon";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem, DateItem } from "@/lib/types";

interface EventDetails {
  date: DateItem;
  group: CandidatureItem;
}

export default function EventDetailPage() {
  const params = useParams();
  const dateId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [instaReady, setInstaReady] = useState(false);

  const prepareInstagramStory = async (group: CandidatureItem, formattedDate: string) => {
    const eventUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://laguinguettedesmarmouz.fr/programmation/${dateId}`;

    const width = 1080;
    const height = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Premium gradient background
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1F2A44");
    gradient.addColorStop(0.5, "#2F5D50");
    gradient.addColorStop(1, "#1F2A44");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Add radial accent
    const radialGradient = context.createRadialGradient(width / 2, height / 3, 0, width / 2, height / 3, 800);
    radialGradient.addColorStop(0, "rgba(246, 201, 69, 0.15)");
    radialGradient.addColorStop(1, "rgba(246, 201, 69, 0)");
    context.fillStyle = radialGradient;
    context.fillRect(0, 0, width, height);

    // Add background image with better opacity
    if (group.photo_url) {
      try {
        const image = new Image();
        image.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Image load failed"));
          image.src = group.photo_url as string;
        });

        context.globalAlpha = 0.3;
        context.drawImage(image, 0, 0, width, height);
        context.globalAlpha = 1;
      } catch {
      }
    }

    // Dark overlay for content area
    const overlayGradient = context.createLinearGradient(0, 200, 0, 1400);
    overlayGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
    overlayGradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");
    context.fillStyle = overlayGradient;
    context.fillRect(0, 200, width, 1200);

    // Accent bar
    context.fillStyle = "#F6C945";
    context.fillRect(0, 220, 12, 250);

    // Group name - premium styling
    context.fillStyle = "#FFFFFF";
    context.font = "bold 88px 'Helvetica Neue', Arial, sans-serif";
    context.textBaseline = "top";
    context.fillText(group.nom_groupe, 80, 260);

    // Style musical
    context.font = "500 48px 'Helvetica Neue', Arial, sans-serif";
    context.fillStyle = "#F6C945";
    context.fillText(group.style_musical || "Concert", 80, 420);

    // Event details
    context.font = "500 44px 'Helvetica Neue', Arial, sans-serif";
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    context.fillText(formattedDate, 80, 530);
    context.fillText(group.ville || "La Guinguette des Marmouz", 80, 620);

    // Event link section
    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.font = "500 32px 'Helvetica Neue', Arial, sans-serif";
    context.fillText("laguinguettedesmarmouz.fr", 80, 800);

    // Bottom call-to-action
    context.font = "500 36px 'Helvetica Neue', Arial, sans-serif";
    context.fillStyle = "#F6C945";
    context.fillText("Ajoute un sticker lien", 80, 1750);

    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.font = "500 28px 'Helvetica Neue', Arial, sans-serif";
    context.fillText("pour accéder à l'événement complet", 80, 1820);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (blob) {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `story-${group.nom_groupe.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }

    const caption = `${group.nom_groupe} • ${group.style_musical || "Concert"}\n${formattedDate}\nLa Guinguette des Marmouz\n${eventUrl}`;
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
    }

    setInstaReady(true);
    setTimeout(() => setInstaReady(false), 2200);
  };

  const getShareLinks = (group: CandidatureItem) => {
    const eventUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://laguinguettedesmarmouz.fr/programmation/${dateId}`;

    const shareText = `Découvrez ${group.nom_groupe} (${group.style_musical || "Concert"}) à La Guinguette des Marmouz : ${eventUrl}`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
    };
  };

  const copyEventLink = async () => {
    try {
      const eventUrl =
        typeof window !== "undefined"
          ? window.location.href
          : `https://laguinguettedesmarmouz.fr/programmation/${dateId}`;
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the date
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

      // Fetch the group for this date
      const { data: groupData, error: groupError } = await supabase
        .from("candidatures")
        .select("*")
        .eq("date_id", dateId)
        .eq("status", "accepted")
        .single();

      if (groupError || !groupData) {
        setError("Groupe non trouvé pour cet événement");
        setLoading(false);
        return;
      }

      setEvent({
        date: dateData as DateItem,
        group: groupData as CandidatureItem,
      });
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Erreur lors du chargement de l'événement");
    } finally {
      setLoading(false);
    }
  }, [dateId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <FestivalHeader />
        <p className="text-[#2F5D50] mt-10">Chargement de l'événement...</p>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <FestivalHeader />
        <Link href="/programmation" className="btn-ghost inline-flex mt-6 mb-6">
          ← Retour à la programmation
        </Link>
        <div className="festival-card text-center">
          <p className="text-[#D94A4A] font-semibold">{error || "Événement non disponible"}</p>
        </div>
      </main>
    );
  }

  const { date, group } = event;
  const youtubeId = group.video_url ? extractYoutubeId(group.video_url) : null;
  const eventDate = new Date(`${date.date}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      <FestivalHeader />

      <Link href="/programmation" className="btn-ghost inline-flex mb-6 mt-6">
        ← Retour à la programmation
      </Link>

      {/* Image Hero */}
      {group.photo_url ? (
        <div className="rounded-xl overflow-hidden mb-8 h-96 md:h-[500px] bg-gray-100">
          <img
            src={group.photo_url}
            alt={group.nom_groupe}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden mb-8 h-96 md:h-[500px] bg-gradient-to-br from-[#F6C945]/30 to-[#D94A4A]/30 flex items-center justify-center">
          <p className="text-[#1F2A44]/40 text-lg">Photo à venir</p>
        </div>
      )}

      {/* Header avec titre et infos */}
      <section className="mb-10">
        <div className="festival-card">
          <p className="text-sm uppercase tracking-wide text-[#1F2A44]/70 font-semibold text-[#D94A4A] mb-3">
            {eventDate}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{group.nom_groupe}</h1>
          <p className="text-xl text-[#1F2A44]/80 mb-2">{group.style_musical || "Style à confirmer"}</p>
          {group.ville && <p className="text-[#1F2A44]/70">📍 {group.ville}</p>}
        </div>
      </section>

      {/* Vidéo YouTube */}
      {youtubeId && (
        <section className="mb-10">
          <div className="festival-card p-0 overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Vidéo du groupe"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* À propos */}
      {(group.bio || group.reseaux) && (
        <section className="mb-10">
          <div className="festival-card">
            <h2 className="section-title mb-4">À propos</h2>
            {group.bio && (
              <p className="text-lg text-[#1F2A44]/80 leading-relaxed whitespace-pre-wrap mb-6">
                {group.bio}
              </p>
            )}
            {group.reseaux && (
              <div>
                <p className="font-semibold text-[#1F2A44] mb-3">Réseaux du groupe</p>
                <div className="flex flex-wrap gap-3">
                  {getSocialLinks(group.reseaux).map(({ url, platform, label }, idx) => {
                    return (
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Boutons de partage */}
      <section className="mb-10">
        <div className="festival-card p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1F2A44]/70 uppercase tracking-wide">Partager</p>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              <a
                href={getShareLinks(group).whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                title="Partager sur WhatsApp"
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                💬
              </a>
              <a
                href={getShareLinks(group).facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Partager sur Facebook"
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                f
              </a>
              <a
                href={getShareLinks(group).bluesky}
                target="_blank"
                rel="noopener noreferrer"
                title="Partager sur Bluesky"
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                🦋
              </a>
              <button
                onClick={() => void copyEventLink()}
                title={copied ? "Lien copié!" : "Copier le lien"}
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                {copied ? "✅" : "🔗"}
              </button>
              <button
                onClick={() => void prepareInstagramStory(group, eventDate)}
                title={instaReady ? "Story prête!" : "Préparer story Instagram"}
                className="h-10 w-10 rounded-full border border-[#1F2A44]/15 bg-white/50 flex items-center justify-center text-[#1F2A44] hover:text-[#2F5D50] hover:border-[#2F5D50] hover:scale-110 transition-all"
              >
                {instaReady ? "✅" : "📷"}
              </button>
            </div>
          </div>
          <p className="text-xs text-[#1F2A44]/50 mt-3 leading-snug">
            Instagram : télécharge le visuel, ajoute-le en story, puis ajoute un sticker lien
          </p>
        </div>
      </section>

      {/* Lien retour */}
      <div className="text-center mb-10">
        <Link href="/programmation" className="btn-ghost inline-flex">
          ← Retour à la programmation
        </Link>
      </div>
    </main>
  );
}
