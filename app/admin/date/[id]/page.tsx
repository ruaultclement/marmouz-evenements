"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CandidatureItem, CandidatureStatus } from "@/lib/types";
import { parseCandidatureThread } from "@/lib/candidatureThread";

type EditFormState = {
  nom_groupe: string;
  style_musical: string;
  ville: string;
  membres: string;
  email: string;
  contact: string;
  reseaux: string;
  cachet: string;
  logement: string;
  document_url: string;
  photo_url: string;
  video_url: string;
  bio: string;
  latitude: string;
  longitude: string;
  status: CandidatureStatus;
};

function toEditForm(candidature: CandidatureItem): EditFormState {
  return {
    nom_groupe: candidature.nom_groupe || "",
    style_musical: candidature.style_musical || "",
    ville: candidature.ville || "",
    membres: candidature.membres === null ? "" : String(candidature.membres),
    email: candidature.email || "",
    contact: candidature.contact || "",
    reseaux: candidature.reseaux || "",
    cachet: candidature.cachet || "",
    logement: candidature.logement || "",
    document_url: candidature.document_url || "",
    photo_url: candidature.photo_url || "",
    video_url: candidature.video_url || "",
    bio: candidature.bio || "",
    latitude: candidature.latitude === null ? "" : String(candidature.latitude),
    longitude: candidature.longitude === null ? "" : String(candidature.longitude),
    status: candidature.status,
  };
}

export default function Page() {
  const params = useParams();
  const dateId = params.id as string;

  const [candidatures, setCandidatures] = useState<CandidatureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  const [editingCandidature, setEditingCandidature] = useState<CandidatureItem | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("candidatures")
      .select("*")
      .eq("date_id", dateId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage("Impossible de charger les candidatures.");
      setCandidatures([]);
      setLoading(false);
      return;
    }

    setCandidatures((data || []) as CandidatureItem[]);
    setLoading(false);
  }, [dateId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  async function accepter(id: string) {
    setErrorMessage(null);

    const { error: acceptError } = await supabase
      .from("candidatures")
      .update({ status: "accepted" })
      .eq("id", id);

    if (acceptError) {
      setErrorMessage("Impossible de confirmer cette candidature.");
      return;
    }

    const { error: refuseOthersError } = await supabase
      .from("candidatures")
      .update({ status: "refused" })
      .eq("date_id", dateId)
      .neq("id", id);

    if (refuseOthersError) {
      setErrorMessage("Candidature confirmee, mais impossible de refuser les autres automatiquement.");
    }

    const { error: dateError } = await supabase
      .from("dates")
      .update({ status: "confirmed" })
      .eq("id", dateId);

    if (dateError) {
      setErrorMessage("Candidature confirmee, mais le statut de la date n'a pas ete mis a jour.");
    }

    void load();
  }

  async function refuser(id: string) {
    const { error } = await supabase
      .from("candidatures")
      .update({ status: "refused" })
      .eq("id", id);

    if (error) {
      setErrorMessage("Impossible de refuser cette candidature.");
      return;
    }

    void load();
  }

  async function sendBookingReply(candidatureId: string) {
    const message = (replyDrafts[candidatureId] || "").trim();
    if (!message) {
      setErrorMessage("Saisissez une reponse avant l'envoi.");
      return;
    }

    if (!adminPassword.trim()) {
      setErrorMessage("Saisissez le mot de passe admin pour envoyer une reponse.");
      return;
    }

    setSendingReplyId(candidatureId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/candidatures/${candidatureId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Impossible d'envoyer la reponse.");
        setSendingReplyId(null);
        return;
      }

      setReplyDrafts((current) => ({ ...current, [candidatureId]: "" }));
      await load();
    } catch {
      setErrorMessage("Erreur reseau lors de l'envoi de la reponse.");
    } finally {
      setSendingReplyId(null);
    }
  }

  function openEditModal(candidature: CandidatureItem) {
    setEditingCandidature(candidature);
    setEditForm(toEditForm(candidature));
  }

  function closeEditModal() {
    setEditingCandidature(null);
    setEditForm(null);
  }

  async function saveEdit() {
    if (!editingCandidature || !editForm) return;

    setSavingEdit(true);
    setErrorMessage(null);

    const membresValue = editForm.membres.trim() ? Number(editForm.membres) : null;
    const latitudeValue = editForm.latitude.trim() ? Number(editForm.latitude) : null;
    const longitudeValue = editForm.longitude.trim() ? Number(editForm.longitude) : null;

    if (Number.isNaN(membresValue as number) || Number.isNaN(latitudeValue as number) || Number.isNaN(longitudeValue as number)) {
      setSavingEdit(false);
      setErrorMessage("Membres/latitude/longitude doivent etre des nombres valides.");
      return;
    }

    const updatePayload = {
      nom_groupe: editForm.nom_groupe.trim(),
      style_musical: editForm.style_musical.trim() || null,
      ville: editForm.ville.trim() || null,
      membres: membresValue,
      email: editForm.email.trim(),
      contact: editForm.contact.trim(),
      reseaux: editForm.reseaux.trim() || null,
      cachet: editForm.cachet.trim() || null,
      logement: editForm.logement.trim() || null,
      photo_url: editForm.photo_url.trim() || null,
      video_url: editForm.video_url.trim() || null,
      bio: editForm.bio.trim() || null,
      latitude: latitudeValue,
      longitude: longitudeValue,
      status: editForm.status,
    };

    let { error } = await supabase
      .from("candidatures")
      .update({ ...updatePayload, document_url: editForm.document_url.trim() || null })
      .eq("id", editingCandidature.id);

    if (error?.message?.toLowerCase().includes("document_url")) {
      const fallback = await supabase
        .from("candidatures")
        .update(updatePayload)
        .eq("id", editingCandidature.id);

      error = fallback.error;
    }

    if (error) {
      setSavingEdit(false);
      setErrorMessage("Impossible de sauvegarder les modifications.");
      return;
    }

    setSavingEdit(false);
    closeEditModal();
    await load();
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/admin" className="btn-ghost inline-flex mb-6">
        ← Retour admin
      </Link>

      <h1 className="text-3xl mb-4">Candidatures de la date</h1>

      <div className="festival-card mb-6">
        <label className="block text-sm font-semibold mb-2">Mot de passe admin (necessaire pour repondre)</label>
        <input
          type="password"
          className="input max-w-md"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="Mot de passe admin"
        />
      </div>

      {errorMessage && <p className="mb-4 text-[#D94A4A]">{errorMessage}</p>}
      {loading && <p className="text-[#2F5D50]">Chargement...</p>}

      {!loading && candidatures.length === 0 && (
        <p className="text-[#2F5D50]">Aucune candidature pour cette date.</p>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        {candidatures.map((c) => {
          const thread = parseCandidatureThread(c.message).messages;

          return (
            <div key={c.id} className="festival-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={
                      c.status === "accepted"
                        ? "badge-confirmed mb-2"
                        : c.status === "pending"
                        ? "badge-open mb-2"
                        : "badge-refused mb-2"
                    }
                  >
                    {c.status === "accepted" ? "Confirme" : c.status === "pending" ? "En attente" : "Refuse"}
                  </p>

                  <h2 className="text-xl font-bold">{c.nom_groupe}</h2>
                  <p className="mt-2 text-[#1F2A44]/80">{c.style_musical || "Style non renseigne"}</p>
                  <p className="text-[#1F2A44]/80">{c.ville || "Ville non renseignee"}</p>
                </div>

                <button className="btn-ghost" onClick={() => openEditModal(c)}>
                  Voir / modifier
                </button>
              </div>

              <div className="mt-3 text-sm space-y-1">
                <p>✉️ {c.email}</p>
                <p>📞 {c.contact || "Non renseigne"}</p>
                <p>🎚 Cachet : {c.cachet || "A definir"}</p>
                <p>🛏 Logement : {c.logement || "A definir"}</p>
                <p>👥 Membres : {c.membres ?? "N/A"}</p>
                {c.document_url ? (
                  <p>
                    📎 Fichier : {" "}
                    <a href={c.document_url} target="_blank" rel="noreferrer" className="underline text-[#2F5D50]">
                      Ouvrir la piece jointe
                    </a>
                  </p>
                ) : (
                  <p>📎 Fichier : Aucun</p>
                )}
              </div>

              <div className="mt-4">
                <p className="font-semibold mb-2">Echanges</p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {thread.length === 0 && <p className="text-sm text-[#1F2A44]/70">Aucun message.</p>}
                  {thread.map((item, index) => {
                    const isArtist = item.author === "artist";
                    return (
                      <div
                        key={`${item.createdAt}-${index}`}
                        className={`rounded p-2 ${isArtist ? "bg-[#F6C945]/25" : "bg-[#2F5D50]/10"}`}
                      >
                        <p className="text-xs text-[#1F2A44]/70 mb-1">
                          {isArtist ? "Artiste" : "Booking"} - {new Date(item.createdAt).toLocaleString("fr-FR")}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Repondre a l'artiste depuis l'app..."
                  value={replyDrafts[c.id] || ""}
                  onChange={(e) =>
                    setReplyDrafts((current) => ({
                      ...current,
                      [c.id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => void sendBookingReply(c.id)}
                  className="btn-festival mt-2"
                  disabled={sendingReplyId === c.id}
                >
                  {sendingReplyId === c.id ? "Envoi..." : "Envoyer la reponse"}
                </button>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                {c.status !== "accepted" && (
                  <button onClick={() => void accepter(c.id)} className="btn-festival">
                    Accepter
                  </button>
                )}

                {c.status !== "refused" && (
                  <button onClick={() => void refuser(c.id)} className="btn-ghost">
                    Refuser
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {editingCandidature && editForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edition candidature">
          <div className="modal-panel">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="badge-open mb-2">Proposition artiste</p>
                <h2 className="text-2xl font-bold">Modifier {editingCandidature.nom_groupe}</h2>
              </div>
              <button className="btn-ghost" onClick={closeEditModal}>
                Fermer
              </button>
            </div>

            <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
              <input
                className="input"
                value={editForm.nom_groupe}
                onChange={(e) => setEditForm((current) => (current ? { ...current, nom_groupe: e.target.value } : null))}
                placeholder="Nom du groupe"
              />
              <input
                className="input"
                value={editForm.style_musical}
                onChange={(e) => setEditForm((current) => (current ? { ...current, style_musical: e.target.value } : null))}
                placeholder="Style musical"
              />
              <input
                className="input"
                value={editForm.ville}
                onChange={(e) => setEditForm((current) => (current ? { ...current, ville: e.target.value } : null))}
                placeholder="Ville"
              />
              <input
                className="input"
                value={editForm.membres}
                onChange={(e) => setEditForm((current) => (current ? { ...current, membres: e.target.value } : null))}
                placeholder="Membres"
                type="number"
                min={1}
              />
              <input
                className="input"
                value={editForm.email}
                onChange={(e) => setEditForm((current) => (current ? { ...current, email: e.target.value } : null))}
                placeholder="Email"
              />
              <input
                className="input"
                value={editForm.contact}
                onChange={(e) => setEditForm((current) => (current ? { ...current, contact: e.target.value } : null))}
                placeholder="Telephone"
              />
              <input
                className="input"
                value={editForm.reseaux}
                onChange={(e) => setEditForm((current) => (current ? { ...current, reseaux: e.target.value } : null))}
                placeholder="Réseaux (liens séparés par virgule)"
              />
              <input
                className="input"
                value={editForm.cachet}
                onChange={(e) => setEditForm((current) => (current ? { ...current, cachet: e.target.value } : null))}
                placeholder="Cachet"
              />
              <input
                className="input"
                value={editForm.logement}
                onChange={(e) => setEditForm((current) => (current ? { ...current, logement: e.target.value } : null))}
                placeholder="Logement"
              />
              <input
                className="input"
                value={editForm.document_url}
                onChange={(e) => setEditForm((current) => (current ? { ...current, document_url: e.target.value } : null))}
                placeholder="URL fichier (PDF / dossier / audio...)"
              />
              <textarea
                className="input"
                rows={4}
                value={editForm.bio}
                onChange={(e) => setEditForm((current) => (current ? { ...current, bio: e.target.value } : null))}
                placeholder="Bio / description du groupe"
              />
              <input
                className="input"
                value={editForm.photo_url}
                onChange={(e) => setEditForm((current) => (current ? { ...current, photo_url: e.target.value } : null))}
                placeholder="URL photo"
              />
              <input
                className="input"
                value={editForm.video_url}
                onChange={(e) => setEditForm((current) => (current ? { ...current, video_url: e.target.value } : null))}
                placeholder="URL video"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="input"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm((current) => (current ? { ...current, latitude: e.target.value } : null))}
                  placeholder="Latitude"
                />
                <input
                  className="input"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm((current) => (current ? { ...current, longitude: e.target.value } : null))}
                  placeholder="Longitude"
                />
              </div>

              <select
                className="input"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((current) => (current ? { ...current, status: e.target.value as CandidatureStatus } : null))
                }
              >
                <option value="pending">En attente</option>
                <option value="accepted">Acceptee</option>
                <option value="refused">Refusee</option>
              </select>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button className="btn-festival w-full sm:w-auto" onClick={() => void saveEdit()} disabled={savingEdit}>
                {savingEdit ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button className="btn-ghost w-full sm:w-auto" onClick={closeEditModal}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}