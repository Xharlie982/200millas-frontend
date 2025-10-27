"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import CustomerHeader from "@/components/customer-header"
import CustomerFooter from "@/components/customer-footer"
import ProductOptionsModal from "@/components/product-options-modal"
import { useCart } from "@/lib/cart-context"
import { apiClient } from "@/lib/api"
import type { MenuItem, MenuCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CartaPage() {
  const { addItem } = useCart()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadItems(selectedCategory)
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const data = await apiClient.menu.getCategories()
      setCategories(data)
      setError(null)
    } catch (error) {
      setError("No se pudo conectar con el servidor. Mostrando datos de ejemplo.")
      setCategories([
        { id: "1", name: "Promos Fast", description: "Promociones rápidas" },
        { id: "2", name: "Express", description: "Platos express" },
        { id: "3", name: "Promociones", description: "Ofertas" },
        { id: "4", name: "Sopas Power", description: "Sopas" },
        { id: "5", name: "Bowls Del Tigre", description: "Bowls" },
        { id: "6", name: "Leche de Tigre", description: "Leche de tigre" },
        { id: "7", name: "Ceviches", description: "Ceviches" },
        { id: "8", name: "Fritazo", description: "Frituras" },
        { id: "9", name: "Mostrimar", description: "Mariscos" },
        { id: "10", name: "Box Marino", description: "Box Marino" },
        { id: "11", name: "Dúos Marinos", description: "Dúos" },
        { id: "12", name: "Tríos Marinos", description: "Tríos" },
        { id: "13", name: "Dobles", description: "Dobles" },
        { id: "14", name: "Rondas Marinas", description: "Rondas" },
        { id: "15", name: "Mega Marino", description: "Mega" },
        { id: "16", name: "Familiares", description: "Familiares" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async (categoryId: string | null) => {
    try {
      const data = await apiClient.menu.getItems({ categoryId })
      setItems(data)
    } catch (error) {
      const mock: MenuItem[] = [
        { id: "p1", name: "Promo Doble Trío Pescado", description: "2 porciones + bebida", price: 46.9, image: "/promo-doble-trio-pescado.jpg", available: true, categoryId: "1" },
        { id: "p2", name: "Ceviche Clásico", description: "Fresco del día", price: 29.9, image: "/ceviche-clasico.jpg", available: true, categoryId: "7" },
        { id: "p3", name: "Mostrimar Especial", description: "Plato marino mixto", price: 39.9, image: "/mostrimar.jpg", available: true, categoryId: "9" },
        { id: "p4", name: "Leche de Tigre Clásica", description: "250ml", price: 14.9, image: "/leche-de-tigre-postres.jpg", available: true, categoryId: "6" },
      ]
      setItems(categoryId ? mock.filter(m => m.categoryId === categoryId) : mock)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleAddToCart = (item: any) => {
    addItem(item)
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const orderedCategoryNames = [
    "Mostrar todo",
    "Promos Fast",
    "Express",
    "Promociones",
    "Sopas Power",
    "Bowls Del Tigre",
    "Leche de Tigre",
    "Ceviches",
    "Fritazo",
    "Mostrimar",
    "Box Marino",
    "Dúos Marinos",
    "Tríos Marinos",
    "Dobles",
    "Rondas Marinas",
    "Mega Marino",
    "Familiares",
  ]

  const getCategoryIdByName = (name: string) => {
    const found = categories.find(c => c.name === name)
    return found?.id ?? null
  }

  const activeCategoryName = orderedCategoryNames.find(n => (n === "Mostrar todo" ? selectedCategory === null : getCategoryIdByName(n) === selectedCategory)) || "Mostrar todo"

  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />

      {/* Hero full-bleed edge-to-edge */}
      <section className="relative h-[300px] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <Image src="/somosceviche2.png" alt="Somos Ceviche" fill className="object-cover" priority />
      </section>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Title */}
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-display font-bold text-[#1000a3]">Explora nuestra carta</h2>
        </div>

        {/* Chips Section */}
        <section className="py-6 px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 justify-items-center">
            {orderedCategoryNames.map((name) => {
              const isAll = name === "Mostrar todo"
              const id = isAll ? null : getCategoryIdByName(name)
              const isActive = isAll ? selectedCategory === null : selectedCategory === id
              return (
                <div key={name} className="relative overflow-visible inline-block">
                  {/* Circular icon outside the chip, overlapped to the left only when active */}
                  <div
                    className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#1000a3] shadow transition-opacity duration-200 ease-in-out flex items-center justify-center z-20 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image src="/favicon.ico" alt="200 Millas" width={28} height={28} />
                  </div>

                  <label
                    onClick={() => setSelectedCategory(id)}
                    className={`inline-flex items-center rounded-full cursor-pointer transition-all text-[18px] h-10 relative ${
                      isActive ? "bg-[#1000a3] text-white" : "bg-[#e2e200] text-[#1000a3]"
                    } ${isActive ? 'pl-[25px] pr-4 py-2' : 'px-4 py-2'}`}
                    style={{ minWidth: isActive ? 111 : 99 }}
                  >
                    <span className="font-display font-bold leading-none">{name}</span>
                  </label>
                </div>
              )
            })}
          </div>

          {/* Search */}
          <div className="mt-6 max-w-full md:max-w-[925.6px]">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar por plato"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[925.6px] h-12 bg-white pr-12 pl-4 text-base border rounded-md"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1000a3]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Loading Screen */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ease-out ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity"></div>
          <div className="relative flex items-center space-x-6 animate-[float_6s_ease-in-out_infinite]">
            <div className="relative">
              <div className="absolute -inset-6 opacity-25">
                <div className="w-40 h-40 rounded-full bg-[#1000a3] blur-3xl"></div>
              </div>
              <Image
                src="/favicon.ico"
                alt="200 Millas"
                width={96}
                height={96}
                className="relative"
                style={{
                  filter: 'none',
                  animation: 'pulse-scale-strong 1.8s ease-in-out infinite'
                }}
              />
            </div>
            <div className="flex items-baseline">
              <span className="text-[#1000a3] font-display font-bold text-5xl">Cargando</span>
              <span className="inline-flex space-x-1 ml-2">
                <span className="text-[#1000a3] font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite]">.</span>
                <span className="text-[#1000a3] font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite_0.2s]">.</span>
                <span className="text-[#1000a3] font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite_0.4s]">.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Category heading (optional) */}
        <div className="mt-2 mb-4">
          <h3 className="text-[#1000a3] font-display text-[20px] mb-4">{activeCategoryName}</h3>
        </div>

        {/* Products */}
        <section className="pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="relative h-48 md:h-[240px]">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1000a3] text-xl md:text-2xl">{item.name}</CardTitle>
                    <CardDescription className="text-sm md:text-base">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#1000a3]">S/ {item.price.toFixed(2)}</span>
                      <Button
                        onClick={() => handleItemClick(item)}
                        disabled={!item.available}
                        className="bg-[#e2e200] text-[#1000a3] hover:bg-[#e2e200]/90 font-bold"
                      >
                        {item.configuracionOpciones && item.configuracionOpciones.length > 0 ? "Personalizar" : "Agregar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
      <CustomerFooter />

      {/* Product Options Modal */}
      {selectedItem && (
        <ProductOptionsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedItem(null)
          }}
          onAddToCart={handleAddToCart}
          menuItem={selectedItem}
        />
      )}
    </div>
  )
}

