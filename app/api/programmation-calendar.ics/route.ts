import { supabase } from "@/lib/supabase";
import { generateICalCalendar } from "@/lib/calendar";
import type { CandidatureItem, DateItem } from "@/lib/types";

function defaultEventTitle(item: DateItem) {
  if (item.event_type === "jam_session") return "Jam session";
  if (item.event_type === "soiree_thematique") return "Soiree thematique";
  if (item.event_type === "autre") return "Evenement special";
  return "Concert";
}

export async function GET() {
  const { data: datesData } = await supabase
    .from("dates")
    .select("*")
    .eq("status", "confirmed")
    .order("date", { ascending: true });

  const confirmedDates = (datesData || []) as DateItem[];
  if (!confirmedDates.length) {
    return new Response("", {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
      },
    });
  }

  const ids = confirmedDates.map((d) => d.id);
  const { data: groupsData } = await supabase
    .from("candidatures")
    .select("*")
    .in("date_id", ids)
    .eq("status", "accepted");

  const groups = (groupsData || []) as CandidatureItem[];
  const byDate = new Map(groups.map((g) => [g.date_id, g]));

  const events = confirmedDates
    .filter((d) => d.show_on_programmation !== false)
    .map((d) => {
      const group = byDate.get(d.id);
      const showGroup = d.highlight_group !== false && d.event_type !== "jam_session" && group;

      return {
        title: showGroup ? `${group.nom_groupe} - ${group.style_musical || "Concert"}` : d.programmation_title || defaultEventTitle(d),
        description: showGroup
          ? group.bio || `Concert de ${group.nom_groupe}`
          : d.programmation_details || d.description || "Evenement a la Guinguette",
        location: "La Guinguette des Marmouz, Plouer-sur-Rance",
        startDate: d.date,
        startTime: "20:00",
        endTime: "23:00",
      };
    });

  const calendar = generateICalCalendar(events);

  return new Response(calendar, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="programmation-guinguette.ics"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
