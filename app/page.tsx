"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import Header from "@/components/header"

const COLORS = ["#0066cc", "#ff6b35", "#f7931e", "#4caf50", "#e91e63"]

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderTime: 0,
  })
  const [ordersByHour, setOrdersByHour] = useState([])
  const [orderStatus, setOrderStatus] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true)
      const dashboardData = await apiClient.dashboard.getSummary()

      if (dashboardData) {
        setStats({
          totalOrders: dashboardData.totalOrders || 0,
          pendingOrders: dashboardData.pendingOrders || 0,
          completedOrders: dashboardData.completedOrders || 0,
          totalRevenue: dashboardData.totalRevenue || 0,
          averageOrderTime: dashboardData.averageOrderTime || 0,
        })

        setOrdersByHour(dashboardData.ordersByHour || [])
        setOrderStatus(dashboardData.orderStatus || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
      // Use mock data as fallback
      setStats({
        totalOrders: 24,
        pendingOrders: 5,
        completedOrders: 19,
        totalRevenue: 1250.5,
        averageOrderTime: 18,
      })
      setOrdersByHour([
        { hour: "10:00", orders: 2 },
        { hour: "11:00", orders: 5 },
        { hour: "12:00", orders: 8 },
        { hour: "13:00", orders: 6 },
        { hour: "14:00", orders: 3 },
      ])
      setOrderStatus([
        { name: "Completados", value: 19 },
        { name: "En Preparación", value: 3 },
        { name: "Pendientes", value: 2 },
      ])
    } finally {
      setDataLoading(false)
    }
  }

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">200 Millas - Panel de Administración</h1>
            <p className="text-blue-100 mt-1">Bienvenido, {user?.name || "Administrador"}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.totalOrders}</div>
                <p className="text-xs text-slate-500 mt-1">Hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</div>
                <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.completedOrders}</div>
                <p className="text-xs text-slate-500 mt-1">Exitosos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">S/. {stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">Hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Tiempo Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.averageOrderTime}m</div>
                <p className="text-xs text-slate-500 mt-1">Por pedido</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pedidos por Hora</CardTitle>
                <CardDescription>Distribución de pedidos durante el día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#0066cc" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Pedidos</CardTitle>
                <CardDescription>Distribución actual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/pedidos">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Pedidos</Button>
                </Link>
                <Link href="/workflow">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Workflow</Button>
                </Link>
                <Link href="/menu">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Gestionar Menú</Button>
                </Link>
                <Link href="/reportes">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">Reportes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
