"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Mail, MessageCircle } from "lucide-react"

export default function ConfiguracionPage() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) return null

  return (
    <div className="p-4 md:p-6 min-h-[464px]">
      <div className="w-full">
        <p className="text-gray-500 text-sm mb-6">Gestiona tus notificaciones de estado de pedidos y publicidad.</p>

        <div className="space-y-4">
            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">Correos con promociones exclusivas</span>
                </div>
                <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">WhatsApp de estado de pedido</span>
                </div>
                <Switch />
            </div>

            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">WhatsApp promocionales</span>
                </div>
                <Switch defaultChecked />
            </div>
        </div>

        <div className="mt-8">
            <Button className="w-full bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold py-6 rounded-lg">
                Guardar cambios
            </Button>
        </div>
      </div>
    </div>
  )
}

