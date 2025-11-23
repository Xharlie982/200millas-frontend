"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MisDatosPage() {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) return null

  return (
    <div className="p-4 md:p-6">
      {/* Removed Header Section as requested */}

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-medium ml-1">Nombre</Label>
                <Input 
                    defaultValue={user?.name?.split(" ")[0] || "Carlos"} 
                    className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-medium ml-1">Apellido</Label>
                <Input 
                    defaultValue={user?.name?.split(" ")[1] || "Alith"} 
                    className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                />
            </div>
            
            <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-medium ml-1">Número</Label>
                <Input 
                    defaultValue="907991386" 
                    className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-medium ml-1">Correo electrónico</Label>
                <Input 
                    defaultValue={user?.email || "asteroidea982@gmail.com"} 
                    disabled
                    className="h-11 bg-gray-200/50 border-gray-200 rounded-lg text-gray-500"
                />
            </div>

            <div className="space-y-2 relative">
                <div className="flex justify-between">
                    <Label className="text-xs text-gray-500 font-medium ml-1">DNI</Label>
                </div>
                <div className="relative">
                    <Input 
                        placeholder="" 
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors pr-10"
                    />
                    <Tooltip>
                        <TooltipTrigger className="absolute right-3 top-1/2 -translate-y-1/2" type="button">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Acumula puntos en todos los canales.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-xs text-gray-500 font-medium ml-1">Fecha de nacimiento</Label>
                </div>
                <div className="relative">
                    <Input 
                        type="date"
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors pr-10"
                    />
                    <Tooltip>
                        <TooltipTrigger className="absolute right-3 top-1/2 -translate-y-1/2" type="button">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Adquiere ofertas exclusivas por tu día.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-medium ml-1">Pronombre</Label>
                <Select>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors">
                        <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="el">Él</SelectItem>
                        <SelectItem value="ella">Ella</SelectItem>
                        <SelectItem value="elle">Elle</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-end justify-start md:justify-start h-11">
                <button className="flex items-center text-[#1000a3] hover:text-red-600 text-sm font-bold transition-colors gap-2">
                    <Trash2 className="w-4 h-4" />
                    Eliminar cuenta
                </button>
            </div>
        </div>

        <div className="mt-8 flex justify-center md:justify-start">
            <Button className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-12 py-6 rounded-lg text-base w-full md:w-auto">
                Guardar
            </Button>
        </div>
      </div>
    </div>
  )
}
