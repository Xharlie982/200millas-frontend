"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, History } from "lucide-react"

export default function MisPedidosPage() {
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
        <h1 className="text-3xl font-bold font-display text-white">Mis pedidos</h1>
        {/* Again, sticking to white text for titles in this section if following the pattern, but content is white bg. 
            Screenshot has "Mis pedidos" centered in white area.
        */}
        <h1 className="text-3xl font-bold font-display text-gray-800 text-center">Mis pedidos</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <p className="text-gray-500 text-sm mb-8 text-center">Ten un espacio para visualizar tus compras realizadas y calificar tus experiencias</p>

        <Tabs defaultValue="proceso" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-200 rounded-none p-0 h-auto mb-8">
                <TabsTrigger 
                    value="proceso"
                    className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#1000a3] data-[state=active]:text-[#1000a3] data-[state=active]:shadow-none py-3 text-gray-500 font-medium flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Pedidos en proceso (0)
                </TabsTrigger>
                <TabsTrigger 
                    value="historial"
                    className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#1000a3] data-[state=active]:text-[#1000a3] data-[state=active]:shadow-none py-3 text-gray-500 font-medium flex items-center justify-center gap-2"
                >
                    <History className="w-4 h-4" />
                    Historial (0)
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="proceso" className="py-8">
                <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500 mb-6 text-sm">Conoce la carta, personaliza tu pedido y compra ¡Todo en una sola web!</p>
                    <Button className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-8 py-2 rounded-lg">
                        Comenzar ahora
                    </Button>
                </div>
            </TabsContent>
            
            <TabsContent value="historial" className="py-8">
                <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <p className="text-gray-500 text-sm">Historial vacío</p>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

