import { sendMail } from "@/lib/mail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      nom_groupe,
      style_musical,
      email,
      contact,
      ville,
      membres,
      reseaux,
      cachet,
      logement,
      message,
    } = body;

    const adminEmail = process.env.MAIL_USER || "admin@example.com";

    // Format email content
    const emailContent = `
Une nouvelle candidature a été reçue !

Groupe: ${nom_groupe}
Style musical: ${style_musical || "Non spécifié"}
Ville: ${ville || "Non spécifié"}
Nombre d'artistes: ${membres || "Non spécifié"}

Contact:
- Email: ${email}
- Téléphone: ${contact}
- Réseaux: ${reseaux || "Non fourni"}

Budget:
- Cachet demandé: ${cachet || "Non spécifié"}
- Logement: ${logement || "Non demandé"}

Message libre:
${message || "Aucun message"}

---
Accédez au panel admin pour valider ou refuser cette candidature.
`;

    // Send admin notification
    await sendMail(
      adminEmail,
      `📋 Nouvelle candidature: ${nom_groupe}`,
      emailContent
    );

    return NextResponse.json(
      { success: true, message: "Notification envoyée" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    // Ne pas exposer les erreurs au client, mais logger
    return NextResponse.json(
      { error: "Impossible d'envoyer la notification" },
      { status: 500 }
    );
  }
}
