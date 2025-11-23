"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { User, Lock, MapPin, ShoppingBag, Trophy, Settings, Power } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ProfileSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Sidebar links are now in the top hero, so we only keep the user card and logout here
  // Or should we keep the links for redundancy? The user said "poner el encabezado en el centro"
  // but also "En la tarjeta que tiene el texto '¡Hola...' hay que hacerla completa".
  // If I remove links, the sidebar is just a card + logout. 
  // Let's assume the user wants the sidebar to be mainly the profile summary card and logout.
  // But wait, standard UX suggests side navigation is useful. 
  // However, duplicate nav might be confusing. 
  // Given the request "poner el encabezado en el centro tipo: 'Mis datos'...", this is a horizontal menu.
  // I will remove the vertical nav links to avoid clutter and strictly follow the "header centered" design.
  // The sidebar will act as a "Profile Summary" + "Actions" area.

  return (
    <div className="w-full shrink-0 space-y-6">
      {/* Full height/width card content - Fixed overflow issues */}
      <div className="bg-[#D1E3FF] rounded-lg p-6 mb-2 text-center break-words shadow-sm">
        <h2 className="text-xl font-bold text-[#1000a3] font-display leading-tight">
          ¡Hola {user?.name?.split(" ")[0] || "Usuario"}!
        </h2>
        <p className="text-sm text-[#1000a3]/80 mt-2">
           {user?.email}
        </p>
      </div>

      <nav className="space-y-1">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Power className="h-5 w-5 text-gray-500 group-hover:text-red-500" />
                <span>Cerrar sesión</span>
              </div>
              <span className="text-lg leading-none">›</span>
            </button>
          </DialogTrigger>
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
