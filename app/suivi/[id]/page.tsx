"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

type ThreadMessage = {
  author: "artist" | "booking";
  body: string;
  createdAt: string;
};

type PortalCandidature = {
  id: string;
  nom_groupe: string;
  status: "pending" | "accepted" | "refused";
  date: string | null;
  document_url: string | null;
  initial_message: string | null;
  thread: ThreadMessage[];
};

const STATUS_LABELS: Record<PortalCandidature["status"], string> = {
  pending: "En attente",
  accepted: "Acceptée",
  refused: "Refusée",
};

const STATUS_COLORS: Record<PortalCandidature["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  refused: "bg-rose-100 text-rose-800",
};

export default function SuiviCandidaturePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidature, setCandidature] = useState<PortalCandidature | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const sortedThread = useMemo(() => {
    if (!candidature) return [];
    return [...candidature.thread].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [candidature]);

  const load = useCallback(async () => {
    if (!token) {
      setError("Lien invalide : token manquant.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/artist/candidature/${id}?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de charger ce suivi.");
        setCandidature(null);
        setLoading(false);
        return;
      }

      setCandidature(data.candidature as PortalCandidature);
      setLoading(false);
    } catch {
      setError("Erreur réseau lors du chargement du suivi.");
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !token) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/artist/candidature/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, message: text }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible d'envoyer le message.");
        setSending(false);
        return;
      }

      setDraft("");
      await load();
    } catch {
      setError("Erreur réseau pendant l'envoi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/" className="btn-ghost inline-flex mb-6">
        ← Retour au site
      </Link>

      <section className="festival-card mb-6">
        <h1 className="text-3xl font-bold mb-3">Suivi de candidature</h1>
        {loading && <p className="text-[#2F5D50]">Chargement du suivi...</p>}
        {!loading && error && <p className="text-[#D94A4A]">{error}</p>}
        {!loading && candidature && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">{candidature.nom_groupe}</p>
            <p>
              Statut: {" "}
              <span className={`inline-flex px-2 py-1 rounded text-sm font-semibold ${STATUS_COLORS[candidature.status]}`}>
                {STATUS_LABELS[candidature.status]}
              </span>
            </p>
            {candidature.date && <p>Date demandée : {new Date(`${candidature.date}T00:00:00`).toLocaleDateString("fr-FR")}</p>}
            {candidature.document_url && (
              <p>
                Pièce jointe : {" "}
                <a href={candidature.document_url} target="_blank" rel="noreferrer" className="underline text-[#2F5D50]">
                  Ouvrir le fichier envoyé
                </a>
              </p>
            )}
          </div>
        )}
      </section>

      {!loading && candidature && (
        <section className="festival-card mb-6">
          <h2 className="text-2xl font-bold mb-4">Échanges</h2>
          <div className="space-y-3">
            {sortedThread.length === 0 && (
              <p className="text-[#1F2A44]/70">Aucun échange pour le moment.</p>
            )}

            {sortedThread.map((item, index) => {
              const isArtist = item.author === "artist";
              return (
                <div
                  key={`${item.createdAt}-${index}`}
                  className={`rounded-xl p-3 ${isArtist ? "bg-[#F6C945]/25" : "bg-[#2F5D50]/10"}`}
                >
                  <p className="text-xs uppercase tracking-wide text-[#1F2A44]/70 mb-1">
                    {isArtist ? "Vous" : "Booking"} - {new Date(item.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <p className="whitespace-pre-wrap text-[#1F2A44]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading && candidature && (
        <section className="festival-card">
          <h2 className="text-2xl font-bold mb-4">Envoyer un message au booking</h2>

          <textarea
            className="input w-full"
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ecrivez votre message..."
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={sendMessage}
              disabled={sending || !draft.trim()}
              className="btn-festival disabled:opacity-60"
            >
              {sending ? "Envoi..." : "Envoyer"}
            </button>
            <button onClick={() => void load()} className="btn-ghost" type="button">
              Rafraichir
            </button>
          </div>
        </section>
      )}
    </main>
  );
}