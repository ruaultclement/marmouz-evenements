import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseCandidatureThread } from "@/lib/candidatureThread";
import { verifyArtistPortalToken } from "@/lib/artistPortalToken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = request.nextUrl.searchParams.get("token") || "";

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

  let { data, error } = await supabase
    .from("candidatures")
    .select("id, nom_groupe, email, status, date_id, message, created_at, document_url")
    .eq("id", id)
    .single();

  if (error?.message?.toLowerCase().includes("document_url")) {
    const fallback = await supabase
      .from("candidatures")
      .select("id, nom_groupe, email, status, date_id, message, created_at")
      .eq("id", id)
      .single();

    data = fallback.data ? { ...fallback.data, document_url: null } : null;
    error = fallback.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  if (data.email?.toLowerCase() !== tokenCheck.payload.email.toLowerCase()) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 401 });
  }

  const { data: dateData } = await supabase
    .from("dates")
    .select("date")
    .eq("id", data.date_id)
    .single();

  const parsed = parseCandidatureThread(data.message);

  return NextResponse.json({
    candidature: {
      id: data.id,
      nom_groupe: data.nom_groupe,
      status: data.status,
      date: dateData?.date || null,
      document_url: data.document_url || null,
      created_at: data.created_at || null,
      initial_message: parsed.initialMessage,
      thread: parsed.messages,
    },
  });
}
