import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { DateItem } from "@/lib/types";

type OpenDateItem = {
  id: string;
  date: string;
  date_label: string;
  description: string | null;
};

export async function GET() {
  const { data, error } = await supabase
    .from("dates")
    .select("id, date, description")
    .eq("status", "open")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load open dates." }, { status: 500 });
  }

  const rows = (data || []) as Pick<DateItem, "id" | "date" | "description">[];

  const items: OpenDateItem[] = rows.map((d) => ({
    id: d.id,
    date: d.date,
    date_label: new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    description: d.description,
  }));

  return NextResponse.json({ items });
}
