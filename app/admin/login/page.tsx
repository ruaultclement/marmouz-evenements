"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FestivalHeader from "@/components/FestivalHeader";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("adminToken", "logged-in");
      router.push("/admin");
    } else {
      setError(data.error || "Erreur de connexion");
    }

    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <FestivalHeader />

      <section className="mt-10">
        <article className="festival-card">
          <h2 className="section-title mb-6">🔐 Accès Admin</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block font-semibold mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-festival w-full disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Se connecter"}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
