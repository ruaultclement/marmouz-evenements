export type DateStatus = "open" | "confirmed";
export type CandidatureStatus = "pending" | "accepted" | "refused";

export type DateItem = {
  id: string;
  date: string;
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
  membres: number;
  contact: string;
  email: string;
  reseaux: string | null;
  cachet: number;
  logement: string | null;
  message: string | null;
  status: CandidatureStatus;
  photo_url: string | null;
  video_url: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
};
