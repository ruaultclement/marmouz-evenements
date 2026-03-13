import { sendMail } from "@/lib/mail";
import { buildArtistPortalUrl, createArtistPortalToken } from "@/lib/artistPortalToken";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function display(value: unknown, fallback = "Non specifie") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function formatDateFr(dateValue: string | null) {
  if (!dateValue) {
    return "Date a confirmer";
  }

  try {
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateValue;
  }
}

function buildNotificationText(data: {
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
  message: string;
  eventDateLabel: string;
}) {
  return `Nouvelle candidature recue !

Date demandee : ${data.eventDateLabel}
Groupe : ${data.nom_groupe}
Style musical : ${data.style_musical}
Ville : ${data.ville}
Nombre d'artistes : ${data.membres}

Contact :
- Email : ${data.email}
- Telephone : ${data.contact}
- Reseaux : ${data.reseaux}

Budget :
- Cachet demande : ${data.cachet}
- Logement : ${data.logement}
- Piece jointe : ${data.document_url}

Message libre :
${data.message}

Panel admin : https://booking.laguinguettedesmarmouz.fr/admin`;
}

function buildNotificationHtml(data: {
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
  message: string;
  eventDateLabel: string;
}) {
  const fileValue = data.document_url;
  const fileCell = /^https?:\/\//i.test(fileValue)
    ? `<a href="${escapeHtml(fileValue)}" style="color:#2f5d50;">Ouvrir le fichier</a>`
    : escapeHtml(fileValue);

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f7f4ef;font-family:Georgia,'Times New Roman',serif;color:#2c241b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;background:#fffaf2;border:1px solid #e8ddcb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:24px;background:linear-gradient(135deg,#2f5d50 0%,#5f8f75 100%);color:#fff8ed;">
                <img src="cid:${MAIL_LOGO_CID}" alt="La Guinguette des Marmouz" width="150" style="display:block;margin:0 0 14px 0;height:auto;border:0;" />
                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:.9;">Booking Marmouz</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;">Nouvelle candidature recue</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <div style="margin:0 0 16px 0;padding:12px 14px;background:#f2ece0;border:1px solid #e8ddcb;border-radius:10px;">
                  <p style="margin:0;font-size:13px;letter-spacing:.3px;text-transform:uppercase;color:#5f5547;font-weight:700;">Date demandee</p>
                  <p style="margin:6px 0 0 0;font-size:18px;font-weight:700;">${escapeHtml(data.eventDateLabel)}</p>
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;width:190px;font-weight:700;">Groupe</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.nom_groupe)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Style musical</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.style_musical)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Ville</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.ville)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Nombre d'artistes</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.membres)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Email</td><td style="padding:10px 0;border-top:1px solid #efe5d6;"><a href="mailto:${escapeHtml(data.email)}" style="color:#2f5d50;">${escapeHtml(data.email)}</a></td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Telephone</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.contact)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Reseaux</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.reseaux)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Cachet demande</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.cachet)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Logement</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${escapeHtml(data.logement)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe5d6;font-weight:700;">Piece jointe</td><td style="padding:10px 0;border-top:1px solid #efe5d6;">${fileCell}</td></tr>
                </table>

                <div style="margin-top:18px;padding:14px 16px;background:#f2ece0;border-radius:10px;border:1px solid #e8ddcb;">
                  <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#5f5547;">Message libre</p>
                  <p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
                </div>

                <p style="margin:22px 0 0 0;">
                  <a href="https://booking.laguinguettedesmarmouz.fr/admin" style="display:inline-block;background:#2f5d50;color:#fffaf2;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">Ouvrir le panel admin</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildArtistAckText(data: {
  nom_groupe: string;
  style_musical: string;
  ville: string;
  membres: string;
  eventDateLabel: string;
  portalUrl: string | null;
}) {
  return `Bonjour ${data.nom_groupe},

Nous avons bien recu votre candidature pour La Guinguette des Marmouz.

Date demandee : ${data.eventDateLabel}

Recapitulatif :
- Groupe : ${data.nom_groupe}
- Style musical : ${data.style_musical}
- Ville : ${data.ville}
- Nombre d'artistes : ${data.membres}

Notre equipe booking va etudier votre proposition et vous recontacter.${
    data.portalUrl ? `\n\nSuivre votre candidature :\n${data.portalUrl}` : ""
  }

Merci pour votre confiance,
Booking - La Guinguette des Marmouz`;
}

function buildArtistAckHtml(data: {
  nom_groupe: string;
  style_musical: string;
  ville: string;
  membres: string;
  eventDateLabel: string;
  portalUrl: string | null;
}) {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:Georgia,'Times New Roman',serif;color:#2f281f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;background:#fffefb;border:1px solid #e6ddce;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(135deg,#d99f4f 0%,#ba6f37 100%);color:#fff7ec;">
                <img src="cid:${MAIL_LOGO_CID}" alt="La Guinguette des Marmouz" width="150" style="display:block;margin:0 0 14px 0;height:auto;border:0;" />
                <p style="margin:0 0 7px 0;font-size:12px;letter-spacing:1.1px;text-transform:uppercase;opacity:.95;">La Guinguette des Marmouz</p>
                <h1 style="margin:0;font-size:27px;line-height:1.2;">Candidature bien recue</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.65;">Bonjour <strong>${escapeHtml(data.nom_groupe)}</strong>, merci pour votre proposition.</p>

                <div style="margin:0 0 16px 0;padding:12px 14px;background:#f2ece0;border:1px solid #e8ddcb;border-radius:10px;">
                  <p style="margin:0;font-size:13px;letter-spacing:.3px;text-transform:uppercase;color:#5f5547;font-weight:700;">Date demandee</p>
                  <p style="margin:6px 0 0 0;font-size:18px;font-weight:700;">${escapeHtml(data.eventDateLabel)}</p>
                </div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:6px 0 0 0;">
                  <tr><td style="padding:10px 0;border-top:1px solid #efe4d2;width:180px;font-weight:700;">Groupe</td><td style="padding:10px 0;border-top:1px solid #efe4d2;">${escapeHtml(data.nom_groupe)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe4d2;font-weight:700;">Style musical</td><td style="padding:10px 0;border-top:1px solid #efe4d2;">${escapeHtml(data.style_musical)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe4d2;font-weight:700;">Ville</td><td style="padding:10px 0;border-top:1px solid #efe4d2;">${escapeHtml(data.ville)}</td></tr>
                  <tr><td style="padding:10px 0;border-top:1px solid #efe4d2;font-weight:700;">Nombre d'artistes</td><td style="padding:10px 0;border-top:1px solid #efe4d2;">${escapeHtml(data.membres)}</td></tr>
                </table>

                <p style="margin:16px 0 0 0;font-size:15px;line-height:1.7;">Notre equipe booking va etudier votre proposition et vous recontacter.</p>

                ${
                  data.portalUrl
                    ? `<p style="margin:18px 0 0 0;"><a href="${data.portalUrl}" style="display:inline-block;background:#2f5d50;color:#fffefb;text-decoration:none;padding:11px 16px;border-radius:8px;font-weight:700;">Suivre ma candidature</a></p>`
                    : ""
                }

                <p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:#665a4b;">Pour que vos reponses apparaissent dans l'app, utilisez le bouton "Suivre ma candidature" puis la messagerie du suivi.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      candidature_id,
      date_id,
      nom_groupe,
      style_musical,
      email,
      contact,
      ville,
      membres,
      reseaux,
      cachet,
      logement,
      document_url,
      message,
    } = body;

    const adminEmail =
      process.env.MAIL_ADMIN_TO ||
      process.env.MAIL_FROM ||
      process.env.SMTP_USER ||
      process.env.MAIL_USER ||
      "admin@example.com";

    let eventDateLabel = "Date a confirmer";

    if (typeof date_id === "string" && date_id && supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data } = await supabase
        .from("dates")
        .select("date")
        .eq("id", date_id)
        .single();

      if (data?.date) {
        eventDateLabel = formatDateFr(data.date);
      }
    }

    const mailData = {
      nom_groupe: display(nom_groupe, "Non specifie"),
      style_musical: display(style_musical, "Non specifie"),
      ville: display(ville, "Non specifie"),
      membres: display(membres, "Non specifie"),
      email: display(email, "Non fourni"),
      contact: display(contact, "Non fourni"),
      reseaux: display(reseaux, "Non fourni"),
      cachet: display(cachet, "Non specifie"),
      logement: display(logement, "Non demande"),
      document_url: display(document_url, "Aucun fichier"),
      message: display(message, "Aucun message"),
      eventDateLabel,
    };

    const artistEmail = typeof email === "string" ? email.trim() : "";
    const hasArtistEmail = /^\S+@\S+\.\S+$/.test(artistEmail);

    await sendMail({
      email: adminEmail,
      subject: `Nouvelle candidature - ${mailData.nom_groupe} - ${mailData.eventDateLabel}`,
      text: buildNotificationText(mailData),
      html: buildNotificationHtml(mailData),
      replyTo: hasArtistEmail ? artistEmail : undefined,
      attachments: [getMailLogoAttachment()],
    });

    if (hasArtistEmail) {
      let portalUrl: string | null = null;

      if (typeof candidature_id === "string" && candidature_id) {
        try {
          const token = createArtistPortalToken({ candidatureId: candidature_id, email: artistEmail });
          portalUrl = buildArtistPortalUrl(candidature_id, token);
        } catch (portalError) {
          console.error("Lien portail artiste non genere:", portalError);
        }
      }

      try {
        await sendMail({
          email: artistEmail,
          subject: `Candidature bien recue - ${mailData.eventDateLabel}`,
          text: buildArtistAckText({ ...mailData, portalUrl }),
          html: buildArtistAckHtml({ ...mailData, portalUrl }),
          attachments: [getMailLogoAttachment()],
        });
      } catch (artistMailError) {
        console.error("Erreur envoi accuse de reception artiste:", artistMailError);
      }
    }

    return NextResponse.json({ success: true, message: "Notification envoyee" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    return NextResponse.json({ error: "Impossible d'envoyer la notification" }, { status: 500 });
  }
}
