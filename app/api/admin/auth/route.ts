import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Erreur serveur: password non configuré" },
      { status: 500 }
    );
  }

  if (password === adminPassword) {
    return NextResponse.json(
      { success: true, message: "Connexion réussie" },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { error: "Mot de passe incorrect" },
    { status: 401 }
  );
}
