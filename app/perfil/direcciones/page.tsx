"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DireccionesPage() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) return null

  return (
    <div className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-display text-gray-800">Direcciones</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="text-gray-500 text-sm mb-6">Gestiona tus direcciones de entrega para tus pedidos.</p>

        <button className="w-full border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors group cursor-pointer">
            <Plus className="w-6 h-6 mb-2 text-gray-400 group-hover:text-[#1000a3]" />
            <span className="text-sm">Añadir una dirección de entrega</span>
        </button>
      </div>
    </div>
  )
}

