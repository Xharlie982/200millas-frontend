"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Trophy, Ticket, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerHeader from "@/components/customer-header"
import CustomerFooter from "@/components/customer-footer"
import { ProfileSidebar } from "@/components/profile-sidebar"

export default function BeneficiosPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [points, setPoints] = useState(0)
  const [redeemed, setRedeemed] = useState(0)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) return null

  // Custom Circular Progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (0 / 100) * circumference; // 0 progress for now

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <CustomerHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Card Reuse */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit lg:sticky lg:top-24 border border-gray-100 w-full lg:w-64 shrink-0">
              <ProfileSidebar />
            </div>

            {/* Content Area */}
            <div className="flex-1">
               <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[600px] p-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-display text-[#1000a3] mb-2">Beneficios</h1>
                    <p className="text-gray-500">Conoce tus puntos generados por tus compras y en qué canjearlos.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Points Circle */}
                    <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r={radius}
                                    stroke="#E5E7EB"
                                    strokeWidth="12"
                                    fill="transparent"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="96"
                                    cy="96"
                                    r={radius}
                                    stroke="#1000a3"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-bold text-black font-display">{points}</span>
                                <div className="w-8 h-8 mt-1 bg-red-600 rounded-full flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            <p className="font-medium text-gray-700">Puntos actuales: {points}</p>
                            <p className="text-gray-500">Canjeados: {redeemed}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="w-full md:w-2/3">
                        <Tabs defaultValue="cupones" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
                                <TabsTrigger 
                                    value="cupones"
                                    className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#1000a3] data-[state=active]:text-[#1000a3] data-[state=active]:shadow-none py-3 text-gray-500 font-medium flex items-center justify-center gap-2"
                                >
                                    <Ticket className="w-4 h-4" />
                                    Cupones
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="historial"
                                    className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#1000a3] data-[state=active]:text-[#1000a3] data-[state=active]:shadow-none py-3 text-gray-500 font-medium flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    Historial
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="cupones" className="py-8">
                                <div className="text-center py-12">
                                    <p className="text-gray-500 font-medium">Sin cupones:</p>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="historial" className="py-8">
                                <div className="text-center py-12">
                                    <p className="text-gray-500 font-medium">No hay historial reciente.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                  </div>
               </div>
            </div>
        </div>
      </div>
      <CustomerFooter />
    </div>
  )
}

