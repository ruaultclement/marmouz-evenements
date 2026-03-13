"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { encodeInitialThread } from "@/lib/candidatureThread";

type GeoPoint = {
  lat: number;
  lon: number;
};

const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024;
const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".odt",
  ".zip",
  ".rar",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".mp3",
  ".wav",
];

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function isAllowedDocument(filename: string) {
  const lower = filename.toLowerCase();
  return ALLOWED_DOCUMENT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

async function geocodeCity(city: string): Promise<GeoPoint | null> {
  if (!city) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&q=${encodeURIComponent(city)}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    if (!response.ok) return null;

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;

    return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
  } catch (error) {
    console.log("Géolocalisation échouée (non-bloquant) :", error);
    return null;
  }
}

export default function Page() {
  const params = useParams();
  const dateId = params.id as string;

  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [dateDescription, setDateDescription] = useState<string | null>(null);
  const [dateLicense, setDateLicense] = useState<string | null>(null);
  const [candidatureGuidelines, setCandidatureGuidelines] = useState(
    "Nous sommes une guinguette conviviale : les concerts font partie d'une offre globale gratuite pour notre clientèle. Nous recherchons de belles propositions artistiques avec un budget réaliste et adapté au lieu."
  );
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [nom, setNom] = useState("");
  const [styleMusical, setStyleMusical] = useState("");
  const [ville, setVille] = useState("");
  const [membres, setMembres] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [website, setWebsite] = useState("");
  const [cachet, setCachet] = useState("");
  const [logement, setLogement] = useState("");
  const [message, setMessage] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isDraggingDocument, setIsDraggingDocument] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadDateInfo() {
      const { data } = await supabase
        .from("dates")
        .select("date, description, spectacle_license")
        .eq("id", dateId)
        .single();

      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value_text")
        .eq("key", "candidature_guidelines")
        .maybeSingle();

      if (data?.date) {
        const formatted = new Date(`${data.date}T00:00:00`).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setDateLabel(formatted.charAt(0).toUpperCase() + formatted.slice(1));
      }

      setDateDescription(data?.description || null);
      setDateLicense(data?.spectacle_license || null);
      if (settingsData?.value_text) {
        setCandidatureGuidelines(settingsData.value_text);
      }
    }

    void loadDateInfo();
  }, [dateId]);

  const socialLinks = useMemo(
    () => [facebook.trim(), instagram.trim(), youtube.trim(), spotify.trim(), tiktok.trim(), website.trim()].filter(Boolean),
    [facebook, instagram, youtube, spotify, tiktok, website]
  );

  const canGoStep2 = nom.trim() && email.trim() && contact.trim();

  async function uploadDocument() {
    if (!documentFile) return null;

    if (documentFile.size > MAX_DOCUMENT_SIZE) {
      throw new Error("Le fichier dépasse 15 Mo. Merci de compresser votre document.");
    }

    if (!isAllowedDocument(documentFile.name)) {
      throw new Error("Format non supporté. Utilisez PDF, DOC, ZIP, image ou audio.");
    }

    const safeName = sanitizeFilename(documentFile.name);
    const filePath = `candidature-documents/${dateId}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from("marmouz-assets").upload(filePath, documentFile, {
      upsert: false,
      contentType: documentFile.type || undefined,
    });

    if (error) {
      throw new Error("Impossible d'uploader le fichier pour le moment.");
    }

    const { data } = supabase.storage.from("marmouz-assets").getPublicUrl(filePath);
    return data.publicUrl || null;
  }

  async function envoyer() {
    if (!canGoStep2) {
      setFeedback("Le nom du groupe, l\'email et le téléphone sont obligatoires.");
      return;
    }

    setSending(true);
    setFeedback(null);

    let lat: number | null = null;
    let lon: number | null = null;

    if (ville.trim()) {
      const geoPoint = await geocodeCity(ville);
      if (geoPoint) {
        lat = geoPoint.lat;
        lon = geoPoint.lon;
      }
    }

    let documentUrl: string | null = null;

    const initialMessage = message.trim() || null;

    const insertPayload = {
      date_id: dateId,
      nom_groupe: nom.trim(),
      style_musical: styleMusical.trim() || null,
      ville: ville.trim() || null,
      latitude: lat,
      longitude: lon,
      membres: membres ? Number(membres) : null,
      email: email.trim(),
      contact: contact.trim(),
      reseaux: socialLinks.join(", ") || null,
      cachet: cachet.trim() || null,
      logement: logement.trim() || null,
      message: encodeInitialThread(initialMessage),
      status: "pending",
    };

    const { data: insertedCandidature, error } = await supabase
      .from("candidatures")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      setFeedback("Erreur lors de l'envoi : " + (error?.message || "Réessayez plus tard"));
      setSending(false);
      return;
    }

    if (documentFile && insertedCandidature?.id) {
      const probe = await supabase
        .from("candidatures")
        .update({ document_url: null })
        .eq("id", insertedCandidature.id);

      if (probe.error?.message?.toLowerCase().includes("document_url")) {
        setSending(false);
        setFeedback("Candidature envoyée. La pièce jointe sera active après migration technique.");
        setIsModalOpen(false);
        return;
      }

      try {
        documentUrl = await uploadDocument();
      } catch (uploadError) {
        setFeedback(uploadError instanceof Error ? uploadError.message : "Impossible d'uploader le fichier.");
        setSending(false);
        return;
      }

      if (documentUrl) {
        const updateDocument = await supabase
          .from("candidatures")
          .update({ document_url: documentUrl })
          .eq("id", insertedCandidature.id);

        if (updateDocument.error) {
          setFeedback("Candidature envoyée, mais le fichier n'a pas pu être rattaché.");
        }
      }
    }

    try {
      await fetch("/api/notify-candidature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_id: dateId,
          candidature_id: insertedCandidature?.id,
          nom_groupe: nom.trim(),
          style_musical: styleMusical.trim(),
          email: email.trim(),
          contact: contact.trim(),
          ville: ville.trim(),
          membres: membres ? Number(membres) : null,
          reseaux: socialLinks.join(", "),
          cachet: cachet.trim(),
          logement: logement.trim(),
          message: message.trim(),
          document_url: documentUrl,
        }),
      });
    } catch {}

    setSending(false);
    setFeedback("Candidature envoyée avec succès. On vous recontacte bientôt.");
    setIsModalOpen(false);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/" className="btn-ghost inline-flex mb-6">
        ← Retour aux dates
      </Link>

      <section className="festival-card">
        <p className="badge-open mb-2">Proposition artiste</p>
        <h1 className="text-3xl mb-3">Postuler sur cette date</h1>
        {dateLabel && <p className="text-lg font-semibold mb-2">{dateLabel}</p>}
        {dateDescription && <p className="text-[#1F2A44]/80 whitespace-pre-wrap mb-4">{dateDescription}</p>}
        <button className="btn-festival" onClick={() => { setIsModalOpen(true); setStep(1); }}>
          Ouvrir la candidature
        </button>
      </section>

      {feedback && (
        <section className="festival-card mt-6">
          <p className="text-[#2F5D50]">{feedback}</p>
        </section>
      )}

      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Proposer votre groupe">
          <div className="modal-panel modal-premium-panel">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="badge-open mb-2">Candidature</p>
                <h2 className="text-2xl font-bold">Proposer votre groupe</h2>
              </div>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                Fermer
              </button>
            </div>

            <div className="mb-5">
              <div className="h-2 rounded-full bg-[#1F2A44]/10 overflow-hidden">
                <div
                  className="h-full bg-[#D94A4A] transition-all"
                  style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                />
              </div>
              <div className="mt-2 text-sm text-[#1F2A44]/70 premium-step-title">
                {step === 1 && "Etape 1/3 - Identite du groupe"}
                {step === 2 && "Etape 2/3 - Details artistiques"}
                {step === 3 && "Etape 3/3 - Recapitulatif"}
              </div>
            </div>

            <div className="max-h-[64vh] overflow-y-auto pr-1">
              {step === 1 && (
                <div className="space-y-3 premium-step-wrap">
                  <input className="input" placeholder="Nom du groupe *" value={nom} onChange={(e) => setNom(e.target.value)} />
                  <input className="input" placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className="input" placeholder="Telephone *" value={contact} onChange={(e) => setContact(e.target.value)} />
                  <input className="input" placeholder="Style musical" value={styleMusical} onChange={(e) => setStyleMusical(e.target.value)} />
                  <input className="input" placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} />
                  <input className="input" placeholder="Nombre d'artistes" type="number" min={1} value={membres} onChange={(e) => setMembres(e.target.value)} />
                  <div className="rounded-lg border border-[#2F5D50]/25 bg-[#2F5D50]/8 p-3 text-sm text-[#1F2A44]">
                    <p className="font-semibold mb-1">Esprit guinguette</p>
                    <p>{candidatureGuidelines}</p>
                    {!dateLicense && (
                      <p className="text-xs mt-2 text-[#1F2A44]/70">
                        Licence entrepreneur du spectacle : en cours d\'affichage (bientôt disponible ici).
                      </p>
                    )}
                    {dateLicense && (
                      <p className="text-xs mt-2 text-[#1F2A44]/70">
                        Licence entrepreneur du spectacle : {dateLicense}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3 premium-step-wrap">
                  <p className="text-sm font-semibold text-[#1F2A44]">Réseaux sociaux (optionnel)</p>
                  <input className="input" placeholder="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                  <input className="input" placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                  <input className="input" placeholder="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                  <input className="input" placeholder="Spotify" value={spotify} onChange={(e) => setSpotify(e.target.value)} />
                  <input className="input" placeholder="TikTok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                  <input className="input" placeholder="Site web" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    <input className="input" placeholder="Cachet demandé" value={cachet} onChange={(e) => setCachet(e.target.value)} />
                  <input className="input" placeholder="Besoin logement" value={logement} onChange={(e) => setLogement(e.target.value)} />
                  <label className="text-sm font-semibold text-[#1F2A44]" htmlFor="artist-document">
                    Dossier / fiche technique (optionnel)
                  </label>
                  <label
                    htmlFor="artist-document"
                    className={`block cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${isDraggingDocument ? "border-[#D94A4A] bg-[#D94A4A]/10" : "border-[#1F2A44]/20 bg-white"}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingDocument(true);
                    }}
                    onDragLeave={() => setIsDraggingDocument(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDraggingDocument(false);
                      const droppedFile = event.dataTransfer.files?.[0];
                      if (droppedFile) setDocumentFile(droppedFile);
                    }}
                  >
                    <p className="text-sm font-semibold text-[#1F2A44]">
                      {documentFile ? `Fichier sélectionné : ${documentFile.name}` : "Glissez-déposez votre fichier ici"}
                    </p>
                    <p className="text-xs text-[#1F2A44]/70 mt-1">ou cliquez pour parcourir</p>
                  </label>
                  <input
                    id="artist-document"
                    className="hidden"
                    type="file"
                    accept=".pdf,.doc,.docx,.odt,.zip,.rar,.png,.jpg,.jpeg,.webp,.mp3,.wav"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-[#1F2A44]/70 -mt-2 mb-1">
                    Formats: PDF, DOC, ZIP, image, audio. Taille max: 15 Mo.
                  </p>
                  <textarea className="input" placeholder="Message libre" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 text-sm premium-step-wrap">
                  <div className="rounded-lg border border-[#1F2A44]/10 p-3 bg-[#FFF7E8] premium-recap-card">
                    <p><strong>Groupe:</strong> {nom || "-"}</p>
                    <p><strong>Email:</strong> {email || "-"}</p>
                    <p><strong>Téléphone :</strong> {contact || "-"}</p>
                    <p><strong>Style:</strong> {styleMusical || "-"}</p>
                    <p><strong>Ville:</strong> {ville || "-"}</p>
                    <p><strong>Membres:</strong> {membres || "-"}</p>
                    <p><strong>Réseaux :</strong> {socialLinks.length ? socialLinks.join(" | ") : "-"}</p>
                    <p><strong>Cachet:</strong> {cachet || "-"}</p>
                    <p><strong>Logement:</strong> {logement || "-"}</p>
                    <p><strong>Fichier:</strong> {documentFile?.name || "-"}</p>
                    <p className="whitespace-pre-wrap"><strong>Message:</strong> {message || "-"}</p>
                  </div>
                </div>
              )}
            </div>

            {feedback && <p className="mt-4 text-sm text-[#D94A4A]">{feedback}</p>}

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              {step > 1 && (
                <button className="btn-ghost w-full sm:w-auto" onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>
                  Précédent
                </button>
              )}

              {step < 3 && (
                <button
                  className="btn-festival w-full sm:w-auto"
                  onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                  disabled={step === 1 && !canGoStep2}
                >
                  Suivant
                </button>
              )}

              {step === 3 && (
                <button onClick={() => void envoyer()} disabled={sending} className="btn-festival w-full sm:w-auto">
                  {sending ? "Envoi en cours..." : "Envoyer candidature"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}