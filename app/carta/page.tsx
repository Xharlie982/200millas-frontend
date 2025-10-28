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
import ProductCard from "@/components/product-card"
import { Search } from "lucide-react"

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
    return found?.id
  }

  const activeCategoryName = orderedCategoryNames.find(n => (n === "Mostrar todo" ? selectedCategory === null : getCategoryIdByName(n) === selectedCategory)) || "Mostrar todo"

  // Two fixed rows: first 8 chips ("Mostrar todo" to "Ceviches"), then remaining 9
  const firstRow = orderedCategoryNames.slice(0, 8)
  const secondRow = orderedCategoryNames.slice(8)

  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />

      {/* Hero full-bleed edge-to-edge */}
      <section className="relative h-[300px] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <Image src="/somosceviche2.png" alt="Somos Ceviche" fill className="object-cover" priority />
      </section>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Title */}
        <div className="mt-10 mb-8 text-center">
          <h2 className="text-3xl font-display font-bold text-[#1000a3]">Explora nuestra carta</h2>
        </div>

        {/* Chips Section */}
        <section className="py-6 px-6 mb-0">
          <div className="flex flex-col gap-3">
            {/* Row 1: 8 chips */}
            <div className="flex flex-nowrap justify-center gap-3 max-w-[1200px] mx-auto overflow-x-auto md:overflow-visible">
              {firstRow.map((name) => {
              const isAll = name === "Mostrar todo"
              const id = isAll ? null : getCategoryIdByName(name)
              const isActive = isAll ? selectedCategory === null : selectedCategory === id
                return (
                  <div key={name} className={`relative overflow-visible inline-block ${isActive ? 'mx-5' : ''}`}>
                  {/* Favicon directly, positioned where the circle was */}
                  <Image
                    src="/favicon.ico"
                    alt="200 Millas"
                    width={48}
                    height={48}
                    priority
                    className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-20 transition-opacity duration-200 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />

                  <label
                    onClick={() => setSelectedCategory(id)}
                      className={`inline-flex items-center rounded-full cursor-pointer transition-all duration-200 ease-in-out text-base h-10 relative whitespace-nowrap ${
                        isActive
                          ? "bg-[#1000a3] text-white"
                          : "bg-[#e2e200] text-[#1000a3] hover:shadow-md"
                      } ${isActive ? 'pl-[25px] pr-4 py-2' : 'px-5 py-2'}`}
                    style={{ minWidth: isActive ? 111 : 99 }}
                  >
                    <span className="font-display font-bold leading-none">{name}</span>
                  </label>
                </div>
              )
              })}
            </div>

            {/* Row 2: 9 chips */}
            <div className="flex flex-nowrap justify-center gap-3 max-w-[1200px] mx-auto overflow-x-auto md:overflow-visible">
              {secondRow.map((name) => {
                const isAll = name === "Mostrar todo"
                const id = isAll ? null : getCategoryIdByName(name)
                const isActive = isAll ? selectedCategory === null : selectedCategory === id
                return (
                  <div key={name} className={`relative overflow-visible inline-block ${isActive ? 'mx-5' : ''}`}>
                    <Image
                      src="/favicon.ico"
                      alt="200 Millas"
                      width={48}
                      height={48}
                      priority
                      className={`absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-20 transition-opacity duration-200 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />

                    <label
                      onClick={() => setSelectedCategory(id)}
                      className={`inline-flex items-center rounded-full cursor-pointer transition-all duration-200 ease-in-out text-base h-10 relative whitespace-nowrap ${
                        isActive
                          ? "bg-[#1000a3] text-white"
                          : "bg-[#e2e200] text-[#1000a3] hover:shadow-md"
                      } ${isActive ? 'pl-[25px] pr-4 py-2' : 'px-5 py-2'}`}
                      style={{ minWidth: isActive ? 111 : 99 }}
                    >
                      <span className="font-display font-bold leading-none">{name}</span>
                    </label>
                  </div>
                )
              })}
            </div>

            {/* Search (left-aligned under second row) */}
            <div className="my-8 max-w-[1200px] mx-auto w-full">
              <div className="relative w-[250px] md:w-[280px]">
                <Input
                  type="text"
                  placeholder="Buscar por plato"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 bg-white pr-10 pl-4 text-base border rounded-md"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              </div>
            </div>
          </div>

          
        </section>

        {/* Loading Screen */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ease-out ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity duration-500 ease-out ${loading ? 'opacity-100' : 'opacity-0'}`}></div>
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
                  animation: 'pulse-scale-strong 1.6s ease-in-out infinite'
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
        <div className="mt-6 mb-4 text-center">
          <h3 className="text-[#1000a3] font-display font-bold text-[20px]">{activeCategoryName}</h3>
        </div>

        {/* Products */}
        <section className="pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} onClick={handleItemClick} />
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

