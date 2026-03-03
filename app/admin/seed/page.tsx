"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SeedPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSeed = async () => {
    if (!password) {
      setError("Veuillez entrer le mot de passe admin")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          `✅ Succès! ${data.datesCount} dates créées et ${data.groupsCount} groupes ajoutés`
        )
        setTimeout(() => router.push("/admin"), 2000)
      } else {
        setError(data.error || "Erreur lors du seed")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de connexion serveur"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EBE0] flex items-center justify-center p-4">
      <div className="festival-card max-w-md w-full">
        <h1 className="text-3xl font-bold text-[#2F5D50] mb-6 text-center">
          Générer les données de test
        </h1>

        <p className="text-[#2F5D50] mb-4 text-sm">
          Cette page créera 12 dates (4 avril - 31 octobre) avec 12 groupes confirmés
          pour tester l'application.
        </p>

        <input
          type="password"
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#2F5D50]/20 rounded-lg mb-4 focus:outline-none focus:border-[#2F5D50]"
        />

        <button
          onClick={handleSeed}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#D94A4A] text-white hover:bg-[#B83A3A]"
          }`}
        >
          {loading ? "Création en cours..." : "Créer les données"}
        </button>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
