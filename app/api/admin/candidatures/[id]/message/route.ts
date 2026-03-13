import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appendThreadMessage, parseCandidatureThread } from "@/lib/candidatureThread";
import { buildArtistPortalUrl, createArtistPortalToken } from "@/lib/artistPortalToken";
import { sendMail } from "@/lib/mail";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";

function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || "https://booking.laguinguettedesmarmouz.fr").replace(/\/$/, "");
}

const MAIL_LOGO_CID = "logo-marmouz";

function getMailLogoAttachment() {
  return {
    filename: "logo-header-mail.png",
    path: path.join(process.cwd(), "public", "images", "logo-header-mail.png"),
    cid: MAIL_LOGO_CID,
    contentType: "image/png",
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const password = typeof body.password === "string" ? body.password : "";
  const text = typeof body.message === "string" ? body.message.trim() : "";

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!text) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("candidatures")
    .select("id, nom_groupe, email, message, date_id")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  const updatedMessage = appendThreadMessage(data.message, "booking", text);

  const { error: updateError } = await supabase
    .from("candidatures")
    .update({ message: updatedMessage })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Impossible d'envoyer la reponse" }, { status: 500 });
  }

  try {
    const token = createArtistPortalToken({ candidatureId: data.id, email: data.email });
    const portalUrl = buildArtistPortalUrl(data.id, token);

    let dateLabel = "Date a confirmer";
    const { data: dateData } = await supabase
      .from("dates")
      .select("date")
      .eq("id", data.date_id)
      .single();

    if (dateData?.date) {
      dateLabel = new Date(`${dateData.date}T00:00:00`).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    await sendMail({
      email: data.email,
      subject: `Nouveau message du booking - ${data.nom_groupe} - ${dateLabel}`,
      text: `Bonjour ${data.nom_groupe},\n\nDate concernee: ${dateLabel}\n\nLe booking vous a repondu:\n\n${text}\n\nPour que vos reponses apparaissent dans l'app, repondez depuis votre espace de suivi:\n${portalUrl}`,
      html: `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#f4f1ea;font-family:Georgia,'Times New Roman',serif;color:#2f281f;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:26px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#fffefb;border:1px solid #e6ddce;border-radius:14px;overflow:hidden;"><tr><td style="padding:22px 24px;background:linear-gradient(135deg,#2f5d50 0%,#1f2a44 100%);color:#fff7ec;"><img src="cid:${MAIL_LOGO_CID}" alt="La Guinguette des Marmouz" width="150" style="display:block;margin:0 0 14px 0;height:auto;border:0;" /><p style="margin:0 0 7px 0;font-size:12px;letter-spacing:1.1px;text-transform:uppercase;opacity:.95;">Booking Marmouz</p><h1 style="margin:0;font-size:27px;line-height:1.2;">Nouveau message pour votre candidature</h1></td></tr><tr><td style="padding:24px;"><p style="margin:0 0 12px 0;font-size:16px;line-height:1.65;">Bonjour <strong>${data.nom_groupe}</strong>.</p><div style="margin:0 0 14px 0;padding:12px 14px;background:#f2ece0;border:1px solid #e8ddcb;border-radius:10px;"><p style="margin:0;font-size:13px;letter-spacing:.3px;text-transform:uppercase;color:#5f5547;font-weight:700;">Date concernee</p><p style="margin:6px 0 0 0;font-size:18px;font-weight:700;">${dateLabel}</p></div><p style="margin:0 0 14px 0;font-size:16px;line-height:1.65;">Le booking vous a envoye un nouveau message.</p><div style="margin-top:10px;padding:14px 16px;background:#f2ece0;border-radius:10px;border:1px solid #e8ddcb;"><p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;">${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p></div><p style="margin:18px 0 0 0;"><a href="${portalUrl}" style="display:inline-block;background:#2f5d50;color:#fffefb;text-decoration:none;padding:11px 16px;border-radius:8px;font-weight:700;">Ouvrir mon espace de suivi</a></p><p style="margin:14px 0 0 0;font-size:13px;line-height:1.6;color:#665a4b;">Repondez depuis cet espace pour que l'echange apparaisse automatiquement dans l'app.</p></td></tr></table></td></tr></table></body></html>`,
      attachments: [getMailLogoAttachment()],
    });
  } catch (mailError) {
    console.error("Erreur envoi notification artiste:", mailError);
  }

  const parsed = parseCandidatureThread(updatedMessage);
  return NextResponse.json({ success: true, thread: parsed.messages });
}
