"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FestivalHeader from "@/components/FestivalHeader";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem } from "@/lib/types";

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [group, setGroup] = useState<CandidatureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [bio, setBio] = useState("");

  const load = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    const { data } = await supabase
      .from("candidatures")
      .select("*")
      .eq("id", id)
      .single();

    const candidature = data as CandidatureItem | null;
    if (!candidature) {
      setError("Groupe non trouvé.");
      setLoading(false);
      return;
    }

    if (candidature.status !== "accepted") {
      setError("Seuls les groupes confirmés peuvent modifier leur fiche.");
      setLoading(false);
      return;
    }

    setGroup(candidature);
    setPhotoUrl(candidature.photo_url || "");
    setVideoUrl(candidature.video_url || "");
    setBio(candidature.bio || "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const { error: err } = await supabase
      .from("candidatures")
      .update({
        photo_url: photoUrl || null,
        video_url: videoUrl || null,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", group.id);

    if (err) {
      setError(`Erreur lors de la sauvegarde: ${err.message}`);
      setSaving(false);
      return;
    }

    setSuccess("Fiche mise à jour avec succès ! 🎉");
    setSaving(false);
    setTimeout(() => {
      router.push("/programmation");
    }, 1500);
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <FestivalHeader />
        <p className="text-[#2F5D50]">Chargement...</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <FestivalHeader />
        <article className="festival-card">
          <p className="text-red-600">{error || "Groupe non trouvé."}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
      <FestivalHeader />

      <section className="mb-10">
        <h2 className="section-title">Modifier ma fiche groupe</h2>

        <article className="festival-card mb-6">
          <h3 className="text-2xl font-bold">{group.nom_groupe}</h3>
          <p className="text-[#1F2A44]/70 mt-1">{group.style_musical}</p>
          <p className="badge-confirmed mt-3">Confirmé pour le {new Date(`${group.date_id}T00:00:00`).toLocaleDateString("fr-FR")}</p>
        </article>

        {error && (
          <article className="festival-card bg-red-50 border border-red-200 mb-6">
            <p className="text-red-700">{error}</p>
          </article>
        )}

        {success && (
          <article className="festival-card bg-green-50 border border-green-200 mb-6">
            <p className="text-green-700">{success}</p>
          </article>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Photo URL */}
          <div>
            <label htmlFor="photo" className="block font-semibold mb-2">
              🖼 URL de votre photo de groupe
            </label>
            <input
              id="photo"
              type="url"
              placeholder="https://exemple.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value.trim())}
              className="input-field"
            />
            <p className="text-xs text-[#1F2A44]/60 mt-1">
              Lien direct vers une image de votre groupe
            </p>
            {photoUrl && (
              <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 h-48">
                <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label htmlFor="video" className="block font-semibold mb-2">
              🎬 Lien vers une vidéo (YouTube, Vimeo, etc.)
            </label>
            <input
              id="video"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value.trim())}
              className="input-field"
            />
            <p className="text-xs text-[#1F2A44]/60 mt-1">
              Partagez une vidéo de vos performances
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-semibold mb-2">
              ✍️ Biographie ou présentation du groupe
            </label>
            <textarea
              id="bio"
              placeholder="Parlez-nous de votre groupe, votre histoire, votre style..."
              value={bio}
              onChange={(e) => setBio(e.target.value.trim())}
              className="input-field min-h-32"
            />
            <p className="text-xs text-[#1F2A44]/60 mt-1">
              {bio.length}/500 caractères
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-festival flex-1 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/programmation")}
              className="btn-ghost flex-1"
            >
              Annuler
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
