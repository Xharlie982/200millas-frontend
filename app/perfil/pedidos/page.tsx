"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, History, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function MisPedidosPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isLoading, isAuthenticated])

  useEffect(() => {
      const fetchOrders = async () => {
          if (isAuthenticated) {
              try {
                  // El backend ya filtra por customer_id automáticamente usando el token
                  const ordersData = await apiClient.orders.getAll()
                  console.log("Orders received:", ordersData)
                  
                  // Asegurar que sea un array
                  const ordersArray = Array.isArray(ordersData) ? ordersData : []
                  setOrders(ordersArray)
              } catch (error: any) {
                  // Si es un error de red (CORS, conexión, etc.), mostrar mensaje amigable
                  console.warn("Error fetching orders:", error?.message || error)
                  // No mostrar toast de error si es un problema de red, solo loguear
                  if (error?.message?.includes('Network error') || error?.message?.includes('Failed to fetch')) {
                      console.log("Backend no disponible, mostrando lista vacía")
                      setOrders([])
                  } else {
                      console.error("Error al cargar pedidos:", error)
                      toast.error("Error al cargar pedidos: " + (error?.message || "Error desconocido"))
                  }
              } finally {
                  setLoadingOrders(false)
              }
          }
      }
      fetchOrders()
  }, [isAuthenticated])


  if (isLoading) return null

  // Filtrar pedidos según estado del backend
  // Estados activos: pending, confirmed, cooking, packing, ready, in_delivery, dispatched
  const activeOrders = orders.filter((o: any) => {
    const status = o.status || o.order_status
    return ['pending', 'confirmed', 'cooking', 'packing', 'ready', 'in_delivery', 'dispatched'].includes(status)
  })
  
  // Estados completados: delivered, cancelled, failed
  const historyOrders = orders.filter((o: any) => {
    const status = o.status || o.order_status
    return ['delivered', 'completed', 'cancelled', 'failed'].includes(status)
  })

  return (
    <div className="p-4 md:p-6 min-h-[464px]">
      <div className="w-full">
        <p className="text-gray-500 text-sm mb-8 text-center">Ten un espacio para visualizar tus compras realizadas y calificar tus experiencias</p>

        <Tabs defaultValue="proceso" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-200 rounded-none p-0 h-auto mb-8">
                <TabsTrigger 
                    value="proceso"
                    className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#1000a3] data-[state=active]:text-[#1000a3] data-[state=active]:shadow-none py-3 text-gray-500 font-medium flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Pedidos en proceso ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger 
                    value="historial"
                    className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#1000a3] data-[state=active]:text-[#1000a3] data-[state=active]:shadow-none py-3 text-gray-500 font-medium flex items-center justify-center gap-2"
                >
                    <History className="w-4 h-4" />
                    Historial ({historyOrders.length})
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="proceso" className="py-8">
                {loadingOrders ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1000a3]" />
                    </div>
                ) : activeOrders.length > 0 ? (
                    <div className="space-y-4">
                        {activeOrders.map((order) => {
                            const orderId = order.order_id || order.id
                            const createdAt = order.created_at || order.createdAt
                            const items = order.items || []
                            const total = order.total || order.totalPrice || 0
                            const status = order.status || order.order_status || 'pending'
                            
                            return (
                                <div key={orderId} className="border border-gray-200 rounded-xl p-6 flex justify-between items-center bg-white shadow-sm">
                                    <div>
                                        <p className="font-bold text-[#1000a3]">Pedido #{orderId}</p>
                                        <p className="text-sm text-gray-500">
                                            {createdAt ? new Date(createdAt * 1000).toLocaleDateString() : 'Fecha no disponible'} - {items.length} productos
                                        </p>
                                        <p className="font-semibold mt-1">Total: S/. {typeof total === 'number' ? total.toFixed(2) : total}</p>
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium capitalize">
                                            {status === 'pending' ? 'Pendiente' : 
                                             status === 'confirmed' ? 'Confirmado' :
                                             status === 'cooking' ? 'Cocinando' :
                                             status === 'packing' ? 'Empacando' :
                                             status === 'ready' ? 'Listo' :
                                             status === 'in_delivery' ? 'En entrega' :
                                             status === 'dispatched' ? 'Despachado' : status}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-gray-500 mb-6 text-sm">Conoce la carta, personaliza tu pedido y compra ¡Todo en una sola web!</p>
                        <Link href="/carta">
                            <Button className="bg-[#1000a3] hover:bg-[#0d008a] text-white font-bold px-8 py-2 rounded-lg">
                                Comenzar ahora
                            </Button>
                        </Link>
                    </div>
                )}
            </TabsContent>
            
            <TabsContent value="historial" className="py-8">
                 {loadingOrders ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1000a3]" />
                    </div>
                ) : historyOrders.length > 0 ? (
                    <div className="space-y-4">
                        {historyOrders.map((order) => {
                            const orderId = order.order_id || order.id
                            const createdAt = order.created_at || order.createdAt
                            const items = order.items || []
                            const total = order.total || order.totalPrice || 0
                            const status = order.status || order.order_status || 'delivered'
                            
                            return (
                                <div key={orderId} className="border border-gray-200 rounded-xl p-6 flex justify-between items-center bg-white shadow-sm">
                                    <div>
                                        <p className="font-bold text-[#1000a3]">Pedido #{orderId}</p>
                                        <p className="text-sm text-gray-500">
                                            {createdAt ? new Date(createdAt * 1000).toLocaleDateString() : 'Fecha no disponible'} - {items.length} productos
                                        </p>
                                        <p className="font-semibold mt-1">Total: S/. {typeof total === 'number' ? total.toFixed(2) : total}</p>
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
                                            {status === 'delivered' ? 'Entregado' :
                                             status === 'completed' ? 'Completado' :
                                             status === 'cancelled' ? 'Cancelado' :
                                             status === 'failed' ? 'Fallido' : status}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-gray-500 text-sm">Historial vacío</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
