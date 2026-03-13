import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = typeof body?.event === "string" ? body.event : "unknown";
    const page = typeof body?.page === "string" ? body.page : "";
    const payload = typeof body?.payload === "object" && body?.payload ? body.payload : {};
    const ts = new Date().toISOString();

    // Keep analytics resilient: never block UI tracking, even if DB config is missing.
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error } = await supabase.from("programmation_analytics").insert({
        event_name: event,
        page_url: page,
        payload,
        user_agent: request.headers.get("user-agent") || "",
        referrer: request.headers.get("referer") || "",
        created_at: ts,
      });

      if (error) {
        console.error("[programmation-analytics][db-error]", error);
      }
    }

    console.log("[programmation-analytics]", {
      event,
      page,
      payload,
      ts,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
