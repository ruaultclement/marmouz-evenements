import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { appendThreadMessage, parseCandidatureThread } from "@/lib/candidatureThread";
import { verifyArtistPortalToken } from "@/lib/artistPortalToken";
import { sendMail } from "@/lib/mail";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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
  const token = typeof body.token === "string" ? body.token : "";
  const text = typeof body.message === "string" ? body.message.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  const tokenCheck = verifyArtistPortalToken(token, id);
  if (!tokenCheck.ok) {
    return NextResponse.json({ error: "Lien invalide ou expire" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("candidatures")
    .select("id, nom_groupe, email, date_id, message")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  if (data.email?.toLowerCase() !== tokenCheck.payload.email.toLowerCase()) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 401 });
  }

  const updatedMessage = appendThreadMessage(data.message, "artist", text);

  const { error: updateError } = await supabase
    .from("candidatures")
    .update({ message: updatedMessage })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Impossible d'envoyer le message" }, { status: 500 });
  }

  const adminEmail =
    process.env.MAIL_ADMIN_TO ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.MAIL_USER ||
    "admin@example.com";

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

  try {
    const appBaseUrl = getAppBaseUrl();

    await sendMail({
      email: adminEmail,
      subject: `Nouveau message artiste - ${data.nom_groupe} - ${dateLabel}`,
      text: `Nouveau message depuis le portail artiste.\n\nDate demandee: ${dateLabel}\nGroupe: ${data.nom_groupe}\nMessage: ${text}\n\nAdmin: ${appBaseUrl}/admin/date/${data.date_id}`,
      html: `<html><body style="font-family:Georgia,serif;background:#f7f4ef;padding:20px;"><div style="max-width:640px;margin:auto;background:#fffaf2;border:1px solid #e8ddcb;border-radius:12px;padding:20px;"><img src="cid:${MAIL_LOGO_CID}" alt="La Guinguette des Marmouz" width="150" style="display:block;margin:0 0 14px 0;height:auto;border:0;" /><h2 style="margin:0 0 12px 0;color:#2f5d50;">Nouveau message artiste</h2><p><strong>Date demandee:</strong> ${dateLabel}</p><p><strong>Groupe:</strong> ${data.nom_groupe}</p><p style="white-space:pre-wrap;">${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p><p><a href="${appBaseUrl}/admin/date/${data.date_id}">Ouvrir la fiche admin</a></p></div></body></html>`,
      replyTo: data.email,
      attachments: [getMailLogoAttachment()],
    });
  } catch (mailError) {
    console.error("Notification admin message artiste non envoyee:", mailError);
  }

  const parsed = parseCandidatureThread(updatedMessage);
  return NextResponse.json({ success: true, thread: parsed.messages });
}
