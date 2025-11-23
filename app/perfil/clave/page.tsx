"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeOff } from "lucide-react"

export default function ClavePage() {
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
        <p className="text-gray-500 text-sm mb-6">Si requieres modificar tu contraseña, asegúrate de que sea segura.</p>

        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full space-y-4">
                <div className="relative">
                    <Input 
                        type="password" 
                        placeholder="Contraseña actual" 
                        className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                    />
                    <EyeOff className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
                <div className="relative">
                    <Input 
                        type="password" 
                        placeholder="Nueva contraseña" 
                        className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                    />
                    <EyeOff className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
                <div className="relative">
                    <Input 
                        type="password" 
                        placeholder="Confirmar nueva contraseña" 
                        className="h-12 bg-white border-gray-200 rounded-lg pr-10"
                    />
                    <EyeOff className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>

                <div className="mt-6">
                    <Button className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-6 py-6 rounded-lg text-sm">
                        Confirmar contraseña
                    </Button>
                </div>
            </div>

            <div className="w-full md:w-auto">
                <Button className="bg-[#e2e200] hover:bg-[#d4d400] text-[#1000a3] font-bold px-6 py-2 rounded-lg text-sm w-full md:w-auto">
                    Recuperar contraseña
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}

