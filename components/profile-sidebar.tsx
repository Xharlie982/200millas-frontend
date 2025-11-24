"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { User, Lock, MapPin, ShoppingBag, Trophy, Settings, Power } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ProfileSidebar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsLogoutOpen(false)
    router.push("/login")
  }

  return (
    <div className="w-full shrink-0 space-y-6">
      {/* Tarjeta de Perfil con Fondo de Olas */}
      <div className="relative bg-[#1000a3] rounded-lg overflow-hidden shadow-sm min-h-[320px] flex flex-col items-center p-8 text-center break-words">
        
        {/* FONDO DE OLAS SVG - Always visible for structure consistency */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Gradiente base sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1000a3] to-[#0d008a]"></div>
            
            {/* Olas SVG */}
            <div className="absolute bottom-0 left-0 w-full">
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block" preserveAspectRatio="none">
                    <path fill="#004e92" fillOpacity="0.5" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <path fill="#4facfe" fillOpacity="0.3" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </div>

        {/* CONTENIDO (Z-10 para estar encima de las olas) */}
        <div className="relative z-10 flex flex-col items-center w-full">
            
            {/* AVATAR ESTILO DAISYUI */}
            <div className="mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-white flex items-center justify-center relative">
                     {isLoading ? (
                         <div className="w-full h-full bg-gray-100 animate-pulse" />
                     ) : (
                         <span className="text-4xl font-bold text-[#1000a3] font-display select-none">
                            {user?.name?.charAt(0) || "U"}
                         </span>
                     )}
                </div>
            </div>

            {/* Text Content Area */}
            <div className="flex flex-col items-center w-full min-h-[60px] justify-center">
                {isLoading ? (
                    <div className="w-full flex flex-col items-center space-y-2">
                        <div className="h-7 w-32 bg-white/20 rounded animate-pulse" />
                        <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-white font-display leading-tight drop-shadow-sm">
                          ¡Hola {user?.name?.split(" ")[0] || "Usuario"}!
                        </h2>
                        <p className="text-sm text-white/90 mt-1 mb-4 font-medium">
                           {user?.email}
                        </p>
                    </>
                )}
            </div>

            {/* BADGES */}
            <div className={cn("flex flex-wrap justify-center gap-2 mt-2 transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}>
                <div className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-[#e2e200] text-[#1000a3] shadow-md border border-yellow-400/50">
                    Miembro Nuevo
                </div>
                <div className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                    Ceviche Lover
                </div>
            </div>
        </div>
      </div>

      <nav className="space-y-1">
        {/* Button is separated from Dialog Trigger logic to prevent hydration mismatch */}
        <button
          disabled={isLoading}
          onClick={() => !isLoading && setIsLogoutOpen(true)}
          className={cn(
              "group flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all mt-4 shadow-sm duration-200",
              isLoading 
                ? "opacity-50 cursor-not-allowed bg-[#1000a3] text-white" 
                : "text-white bg-[#1000a3] hover:bg-red-600 cursor-pointer hover:shadow-md"
          )}
        >
          <div className="flex items-center gap-3">
            <Power className="h-5 w-5 text-white transition-colors" />
            <span className="font-semibold">Cerrar sesión</span>
          </div>
        </button>

        {/* Dialog controlled by state, outside of the trigger flow */}
        <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold uppercase font-display">Confirmar</DialogTitle>
              <DialogDescription className="text-center text-gray-600 py-4">
                ¿Deseas cerrar sesión?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="text-[#1000a3] hover:bg-blue-50 font-bold cursor-pointer">
                  No, seguir navegando
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-8 cursor-pointer"
                onClick={handleLogout}
              >
                Sí, salir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  )
}
