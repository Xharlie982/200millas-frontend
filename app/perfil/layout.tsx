import { ProfileSidebar } from "@/components/profile-sidebar"
import CustomerHeader from "@/components/customer-header"
import CustomerFooter from "@/components/customer-footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <CustomerHeader />
      
      {/* Banner Background - Further Reduced Height to ~96px (h-24) */}
      <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: "url('/ceviches.png')" }}>
         {/* Overlay Gradiente */}
         <div className="absolute inset-0 bg-gradient-to-b from-[#1000a3]/90 to-[#1000a3]/40"></div>
         
         <div className="absolute inset-0 flex items-center justify-center max-w-7xl mx-auto px-4">
            <div className="w-full flex flex-col items-center justify-center h-full relative">
                <Link href="/" className="absolute left-0 inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Link>
                
                {/* Centered Navigation */}
                <div className="flex items-center gap-4 md:gap-8 overflow-x-auto max-w-full no-scrollbar pt-1">
                   <Link href="/perfil/mis-datos" className="text-white/90 hover:text-white font-bold whitespace-nowrap text-sm md:text-base hover:underline decoration-2 underline-offset-4 transition-all">
                      Mis datos
                   </Link>
                   <Link href="/perfil/clave" className="text-white/70 hover:text-white font-medium whitespace-nowrap text-sm md:text-base hover:underline decoration-2 underline-offset-4 transition-all">
                      Contraseña
                   </Link>
                   <Link href="/perfil/direcciones" className="text-white/70 hover:text-white font-medium whitespace-nowrap text-sm md:text-base hover:underline decoration-2 underline-offset-4 transition-all">
                      Direcciones
                   </Link>
                   <Link href="/perfil/pedidos" className="text-white/70 hover:text-white font-medium whitespace-nowrap text-sm md:text-base hover:underline decoration-2 underline-offset-4 transition-all">
                      Mis pedidos
                   </Link>
                   <Link href="/perfil/beneficios" className="text-white/70 hover:text-white font-medium whitespace-nowrap text-sm md:text-base hover:underline decoration-2 underline-offset-4 transition-all">
                      Beneficios
                   </Link>
                   <Link href="/perfil/configuracion" className="text-white/70 hover:text-white font-medium whitespace-nowrap text-sm md:text-base hover:underline decoration-2 underline-offset-4 transition-all">
                      Configuración
                   </Link>
                </div>
            </div>
         </div>
      </div>

      <main className="flex-1 mt-6 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Card - Always Visible */}
            <div className="h-fit lg:sticky lg:top-24 w-full lg:w-64 shrink-0">
              <ProfileSidebar />
            </div>

            {/* Content Area */}
            <div className="flex-1">
               <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[600px]">
                  {children}
               </div>
            </div>

          </div>
        </div>
      </main>
      
      <CustomerFooter />
    </div>
  )
}
