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
                  const res = await apiClient.orders.getAll({ customerId: user?.id })
                  // Handle mock response structure { data: [...] } or direct array
                  const ordersData = res.data || (Array.isArray(res) ? res : [])
                  // Filter orders for current user if mock returns all
                  const userOrders = ordersData.filter((o: any) => o.customerId === user?.id)
                  setOrders(userOrders)
              } catch (error) {
                  console.error("Error fetching orders:", error)
                  toast.error("Error al cargar pedidos")
              } finally {
                  setLoadingOrders(false)
              }
          }
      }
      fetchOrders()
  }, [isAuthenticated, user?.id])


  if (isLoading) return null

  const activeOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing')
  const historyOrders = orders.filter((o: any) => o.status === 'completed' || o.status === 'cancelled' || o.status === 'delivered')

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
                        {activeOrders.map((order) => (
                            <div key={order.id} className="border border-gray-200 rounded-xl p-6 flex justify-between items-center bg-white shadow-sm">
                                <div>
                                    <p className="font-bold text-[#1000a3]">Pedido #{order.id}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} - {order.items.length} productos</p>
                                    <p className="font-semibold mt-1">Total: S/. {order.totalPrice?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium capitalize">
                                        {order.status === 'pending' ? 'Pendiente' : order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
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
                        {historyOrders.map((order) => (
                            <div key={order.id} className="border border-gray-200 rounded-xl p-6 flex justify-between items-center bg-white shadow-sm">
                                <div>
                                    <p className="font-bold text-[#1000a3]">Pedido #{order.id}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} - {order.items.length} productos</p>
                                    <p className="font-semibold mt-1">Total: S/. {order.totalPrice?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
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
