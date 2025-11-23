"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Trophy, Ticket, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress" // We might need a circular one, custom implementation below
import Image from "next/image"

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
    <div className="p-4 md:p-6 min-h-[464px]">
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
                    <div className="w-8 h-8 mt-1 rounded-full flex items-center justify-center overflow-hidden relative">
                        <Image 
                            src="/favicon.ico" 
                            alt="Icon" 
                            width={32} 
                            height={32} 
                            className="object-cover"
                        />
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
  )
}
