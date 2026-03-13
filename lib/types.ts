export type DateStatus = "open" | "confirmed";
export type CandidatureStatus = "pending" | "accepted" | "refused";
export type EventType = "concert" | "jam_session" | "soiree_thematique" | "autre";

export type DateItem = {
  id: string;
  date: string;
  description: string | null;
  event_type: EventType | null;
  first_part_title: string | null;
  show_on_programmation: boolean | null;
  highlight_group: boolean | null;
  programmation_title: string | null;
  programmation_details: string | null;
  spectacle_license: string | null;
  status: DateStatus;
  created_at?: string;
};

export type CandidatureItem = {
  id: string;
  date_id: string;
  nom_groupe: string;
  style_musical: string | null;
  ville: string | null;
  latitude: number | null;
  longitude: number | null;
  membres: number | null;
  contact: string;
  email: string;
  reseaux: string | null;
  cachet: string | null;
  logement: string | null;
  document_url: string | null;
  message: string | null;
  status: CandidatureStatus;
  photo_url: string | null;
  video_url: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
};
