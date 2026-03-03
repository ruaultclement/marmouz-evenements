"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FestivalHeader from "@/components/FestivalHeader";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem } from "@/lib/types";

export default function AdminEditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [group, setGroup] = useState<CandidatureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);

  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [website, setWebsite] = useState("");

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

    setGroup(candidature);
    setPhotoUrl(candidature.photo_url || "");
    setVideoUrl(candidature.video_url || "");
    setBio(candidature.bio || "");
    // Parse social networks
    if (candidature.reseaux) {
      const urls = candidature.reseaux.split(",").map(u => u.trim());
      urls.forEach(url => {
        if (url.includes("facebook")) setFacebook(url);
        else if (url.includes("instagram")) setInstagram(url);
        else if (url.includes("youtube")) setYoutube(url);
        else if (url.includes("spotify")) setSpotify(url);
        else if (url.includes("tiktok")) setTiktok(url);
        else setWebsite(url);
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (isAuthed) {
      const timer = setTimeout(() => {
        void load();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthed, load]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group) return;

    setUploading(true);
    setError("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${group.id}-${Date.now()}.${fileExt}`;
      const filePath = `groupe-photos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("marmouz-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("marmouz-assets")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setPhotoUrl(data.publicUrl);
      }
    } catch (err) {
      setError(`Erreur upload: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
    } finally {
      setUploading(false);
    }
  };

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
        reseaux: [facebook, instagram, youtube, spotify, tiktok, website].filter(Boolean).join(", ") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", group.id);

    if (err) {
      setError(`Erreur: ${err.message}`);
      setSaving(false);
      return;
    }

    setSuccess("Groupe mis à jour ! 🎉");
    setSaving(false);
    setTimeout(() => {
      router.push("/admin/groupes");
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (!isAuthed) {
    return null;
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <FestivalHeader />
        <p className="text-[#2F5D50] mt-10">Chargement...</p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <FestivalHeader />
        <article className="festival-card mt-10">
          <p className="text-red-600">{error || "Groupe non trouvé."}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
      <FestivalHeader />

      <section className="mb-10">
        <div className="flex justify-between items-start mb-6">
          <h2 className="section-title">Éditer le groupe</h2>
          <button onClick={handleLogout} className="btn-ghost text-sm">
            Déconnexion
          </button>
        </div>

        <article className="festival-card mb-6">
          <h3 className="text-2xl font-bold">{group.nom_groupe}</h3>
          <p className="text-[#1F2A44]/70 mt-1">{group.style_musical}</p>
          <p className="badge-confirmed mt-3">Confirmé</p>
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
          {/* Photo Upload */}
          <div>
            <label htmlFor="photo" className="block font-semibold mb-2">
              🖼 Photo du groupe
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-[#1F2A44]/20 rounded-lg p-4 text-center">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handlePhotoUpload(e)}
                  disabled={uploading}
                  className="w-full cursor-pointer"
                />
                <p className="text-sm text-[#1F2A44]/60 mt-2">
                  {uploading ? "Upload en cours..." : "Cliquez pour uploader une image"}
                </p>
              </div>
              <p className="text-xs text-[#1F2A44]/50">Ou saisissez une URL directe :</p>
              <input
                type="url"
                placeholder="https://exemple.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value.trim())}
                className="input-field"
                disabled={uploading}
              />
            </div>
            {photoUrl && (
              <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 h-48 border border-[#1F2A44]/10">
                <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label htmlFor="video" className="block font-semibold mb-2">
              🎬 Lien vidéo
            </label>
            <input
              id="video"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value.trim())}
              className="input-field"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-semibold mb-2">
              ✍️ Bio
            </label>
            <textarea
              id="bio"
              placeholder="Présentation du groupe..."
              value={bio}
              onChange={(e) => setBio(e.target.value.trim())}
              className="input-field min-h-32"
            />
            <p className="text-xs text-[#1F2A44]/60 mt-1">
              {bio.length}/500 caractères
            </p>
          </div>

          {/* Social Media */}
          <div>
            <label className="block font-semibold mb-3">🔗 Réseaux sociaux</label>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Facebook: https://facebook.com/..."
                value={facebook}
                onChange={(e) => setFacebook(e.target.value.trim())}
                className="input-field"
              />
              <input
                type="url"
                placeholder="Instagram: https://instagram.com/..."
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.trim())}
                className="input-field"
              />
              <input
                type="url"
                placeholder="YouTube: https://youtube.com/..."
                value={youtube}
                onChange={(e) => setYoutube(e.target.value.trim())}
                className="input-field"
              />
              <input
                type="url"
                placeholder="Spotify: https://open.spotify.com/..."
                value={spotify}
                onChange={(e) => setSpotify(e.target.value.trim())}
                className="input-field"
              />
              <input
                type="url"
                placeholder="TikTok: https://tiktok.com/..."
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value.trim())}
                className="input-field"
              />
              <input
                type="url"
                placeholder="Site web ou autre"
                value={website}
                onChange={(e) => setWebsite(e.target.value.trim())}
                className="input-field"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-festival flex-1 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/groupes")}
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
