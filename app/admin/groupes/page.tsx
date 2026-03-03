"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FestivalHeader from "@/components/FestivalHeader";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { CandidatureItem, DateItem } from "@/lib/types";

type GroupWithDate = CandidatureItem & { date: string };

export default function AdminGroupesPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const load = useCallback(async () => {
    setLoading(true);

    // Récupérer les dates confirmées
    const { data: datesData } = await supabase
      .from("dates")
      .select("*")
      .eq("status", "confirmed")
      .order("date", { ascending: true });

    const confirmedDates = (datesData || []) as DateItem[];
    if (!confirmedDates.length) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Récupérer les groupes acceptés associés
    const ids = confirmedDates.map((d) => d.id);
    const { data: groupsData } = await supabase
      .from("candidatures")
      .select("*")
      .in("date_id", ids)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    const candidatures = (groupsData || []) as CandidatureItem[];
    const dateMap = new Map(confirmedDates.map((d) => [d.id, d.date]));

    const groupsWithDates: GroupWithDate[] = candidatures.map((g) => ({
      ...g,
      date: dateMap.get(g.date_id) || "N/A",
    }));

    setGroups(groupsWithDates);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthed) {
      const timer = setTimeout(() => {
        void load();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthed, load]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (!isAuthed) {
    return null;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      <FestivalHeader />

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title">👥 Groupes Confirmés</h2>
          <button onClick={handleLogout} className="btn-ghost text-sm">
            Déconnexion
          </button>
        </div>

        {loading ? (
          <p className="text-[#2F5D50]">Chargement des groupes...</p>
        ) : groups.length === 0 ? (
          <article className="festival-card">
            <p>Aucun groupe confirmé pour l&apos;instant.</p>
          </article>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <article key={group.id} className="festival-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="badge-confirmed mb-2">Confirmé</p>
                    <h3 className="text-2xl font-bold">{group.nom_groupe}</h3>
                    <p className="text-[#1F2A44]/70 mt-1">{group.style_musical || "Style"}</p>
                    <p className="text-sm text-[#1F2A44]/60 mt-1">
                      📅 {new Date(`${group.date}T00:00:00`).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Link href={`/admin/groupe/${group.id}/edit`}>
                    <button className="btn-festival whitespace-nowrap">
                      Éditer →
                    </button>
                  </Link>
                </div>

                {/* Quick info */}
                <div className="mt-4 pt-4 border-t border-[#1F2A44]/10 grid gap-2 text-sm">
                  {group.photo_url && <p>✓ Photo</p>}
                  {group.video_url && <p>✓ Vidéo</p>}
                  {group.bio && <p>✓ Bio</p>}
                  {!group.photo_url && !group.video_url && !group.bio && (
                    <p className="text-[#1F2A44]/60">Aucune info media pour le moment</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
