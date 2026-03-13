import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { CandidatureItem, DateItem } from "@/lib/types";

type PublicProgramItem = {
  id: string;
  date: string;
  date_label: string;
  event_title: string;
  subtitle: string;
  details: string | null;
  location: string | null;
  photo_url: string | null;
  detail_url: string;
};

function defaultEventTitle(item: DateItem) {
  if (item.event_type === "jam_session") return "Jam session";
  if (item.event_type === "soiree_thematique") return "Soiree thematique";
  if (item.event_type === "autre") return "Evenement special";
  return "Concert";
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "https://booking.laguinguettedesmarmouz.fr";

  const { data: datesData, error: datesError } = await supabase
    .from("dates")
    .select("*")
    .eq("status", "confirmed")
    .order("date", { ascending: true });

  if (datesError) {
    return NextResponse.json({ error: "Failed to load programmation." }, { status: 500 });
  }

  const confirmedDates = (datesData || []) as DateItem[];
  if (!confirmedDates.length) {
    return NextResponse.json({ items: [] });
  }

  const dateIds = confirmedDates.map((d) => d.id);
  const { data: groupsData } = await supabase
    .from("candidatures")
    .select("*")
    .in("date_id", dateIds)
    .eq("status", "accepted");

  const groups = (groupsData || []) as CandidatureItem[];
  const byDate = new Map(groups.map((g) => [g.date_id, g]));

  const items: PublicProgramItem[] = confirmedDates
    .filter((d) => d.show_on_programmation !== false)
    .map((d) => {
      const group = byDate.get(d.id);
      const showGroup = d.highlight_group !== false && d.event_type !== "jam_session" && group;
      const dateLabel = new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return {
        id: d.id,
        date: d.date,
        date_label: dateLabel,
        event_title: showGroup ? group.nom_groupe : d.programmation_title || defaultEventTitle(d),
        subtitle: showGroup
          ? group.style_musical || "Style a confirmer"
          : d.first_part_title
            ? `Avec premiere partie: ${d.first_part_title}`
            : defaultEventTitle(d),
        details: showGroup ? group.bio : d.programmation_details || d.description,
        location: showGroup ? group.ville : null,
        photo_url: showGroup ? group.photo_url : null,
        detail_url: `${baseUrl}/programmation/${d.id}`,
      };
    });

  return NextResponse.json({ items });
}
