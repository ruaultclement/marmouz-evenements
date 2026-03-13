import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = typeof body?.event === "string" ? body.event : "unknown";
    const page = typeof body?.page === "string" ? body.page : "";
    const payload = typeof body?.payload === "object" && body?.payload ? body.payload : {};

    // Simple analytics: logs are visible in PM2 and can be exported if needed.
    console.log("[programmation-analytics]", {
      event,
      page,
      payload,
      ts: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
