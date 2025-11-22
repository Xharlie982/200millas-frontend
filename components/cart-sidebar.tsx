"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2, Pencil, Store, ShoppingCart } from "lucide-react"
import type { CartItemWithOptions, SelectedOptionsByGroup } from "@/lib/cart-context"
import { SheetClose } from "@/components/ui/sheet"
import { XIcon } from "lucide-react"

interface CartSidebarProps {
  items: CartItemWithOptions[]
  onRemove: (itemId: string) => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onCheckout: () => void
  isLoading?: boolean
  onContinueShopping?: () => void
  onEditItem?: (item: CartItemWithOptions) => void
}

const formatCurrency = (value: number) => `S/. ${value.toFixed(2)}`

type Modalidad = "recojo" | "delivery"

const splitSelections = (selectedOptions: SelectedOptionsByGroup) => {
  const bebidas: string[] = []
  const opciones: string[] = []
  const extras: string[] = []

  Object.entries(selectedOptions || {}).forEach(([groupId, selections]) => {
    if (!selections || selections.length === 0) return

    const groupName = (selections[0].groupName || groupId).toLowerCase()

    const isBebidas =
      groupName.includes("bebida") ||
      groupName.includes("bebidas") ||
      groupName.includes("chicha morada")

    const isExtras = groupId === "adicionales" || groupName.includes("algo más")

    selections.forEach((s) => {
      if (!s.name) return
      
      if (isBebidas) {
        bebidas.push(`${s.name} (${s.quantity})`)
      } else if (isExtras) {
        extras.push(`${s.name} (${s.quantity})`)
      } else {
        opciones.push(s.quantity > 1 ? `${s.name} (${s.quantity})` : s.name)
      }
    })
  })

  return { bebidas, opciones, extras }
}

// Icono de Moto personalizado (similar a Rappi/PedidosYa)
const MotoIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M19 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M7.5 14h5l4 -4h-10.5m1.5 4l4 -4" />
    <path d="M13 6h2l1.5 3l2 4" />
  </svg>
)

export default function CartSidebar({
  items,
  onRemove,
  onQuantityChange,
  onCheckout,
  isLoading,
  onContinueShopping,
  onEditItem,
}: CartSidebarProps) {
  const [modalidad, setModalidad] = useState<Modalidad>("recojo")

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)
  const extras = Math.max(0, total - subtotal)

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex items-center justify-between px-4 py-2.5">
        <h2 className="text-3xl font-bold text-gray-900">Mi carrito</h2>
        
        {/* Botón de cierre alineado horizontalmente con el título */}
        <SheetClose className="flex h-10 w-10 items-center justify-center rounded-full hover:scale-110 transition-transform cursor-pointer">
           <XIcon className="h-6 w-6 text-gray-900" />
           <span className="sr-only">Cerrar</span>
        </SheetClose>
      </header>

      {items.length > 0 && (
        <div className="px-4 pb-2.5 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-4">
            <p className="text-base font-bold text-gray-700 whitespace-nowrap">Modalidad:</p>
            <div className="flex flex-1 gap-2">
              <button
                type="button"
                onClick={() => setModalidad("recojo")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  modalidad === "recojo"
                    ? "bg-[#1000a3] text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Recojo</span>
              </button>
              <button
                type="button"
                onClick={() => setModalidad("delivery")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  modalidad === "delivery"
                    ? "bg-[#1000a3] text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                <MotoIcon className="h-4 w-4" />
                <span>Delivery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-6">
             <ShoppingCart className="h-24 w-24 text-gray-300" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</p>
          <p className="text-gray-500 mb-8">Aún no tienes productos en tu carrito.</p>
          
          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full rounded-2xl bg-[#1000a3] py-4 text-base font-bold text-white shadow-lg hover:bg-[#0d0085] transition-all cursor-pointer"
          >
            Comenzar a comprar
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2">
            {items.map((item) => {
              const { bebidas, opciones, extras } = splitSelections(item.selectedOptions)

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-[#FFF9E5] p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Header: Imagen, Título y Edit */}
                  <div className="flex gap-5">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base font-bold text-gray-900 leading-tight pr-8">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onEditItem?.(item)}
                          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1000a3] border border-[#1000a3] text-white cursor-pointer shadow-sm"
                          aria-label={`Editar ${item.name}`}
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Detalles */}
                      <div className="mt-3 space-y-2">
                        {bebidas.length > 0 && (
                          <ul className="text-sm text-gray-600 leading-relaxed pl-4 space-y-1">
                            {bebidas.map((bebida, i) => (
                              <li key={i} className="list-disc">{bebida}</li>
                            ))}
                          </ul>
                        )}
                        
                        {opciones.length > 0 && (
                          <div>
                            <p className="text-sm font-bold text-gray-700">Opciones:</p>
                            <ul className="text-sm text-gray-600 leading-relaxed list-disc pl-4">
                              {opciones.map((opt, i) => (
                                <li key={i}>{opt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {extras.length > 0 && (
                          <div>
                            <p className="text-sm font-bold text-gray-700">Extras:</p>
                            <ul className="text-sm text-gray-600 leading-relaxed list-disc pl-4">
                              {extras.map((extra, i) => (
                                <li key={i}>{extra}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Card: Precio y Controles */}
                  <div className="flex items-center justify-between mt-2 pt-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</span>
                    </div>

                    <div className="flex items-center gap-3 bg-[#1000a3] rounded-full px-1 py-1 shadow-sm">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            onRemove(item.id)
                          } else {
                            onQuantityChange(item.id, Math.max(1, item.quantity - 1))
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white cursor-pointer"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-5 w-5" />
                        ) : (
                          <Minus className="h-5 w-5" />
                        )}
                      </button>
                      <span className="w-8 text-center text-lg font-bold text-white select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white cursor-pointer"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <footer className="mt-auto border-t border-gray-200 pt-4 pb-4 px-4 space-y-3 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="space-y-2">
              <div className="flex justify-between text-base font-medium text-gray-600 border-b border-gray-100 pb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-600 border-b border-gray-100 pb-1">
                <span>Extras:</span>
                <span>{formatCurrency(extras)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-[#1000a3] pt-1">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={onCheckout}
                disabled={isLoading}
                className="w-full rounded-2xl bg-[#1000a3] py-4 text-base font-bold text-white shadow-lg hover:bg-[#0d0085] hover:shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Procesando..." : "Confirmar"}
              </button>
              
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full rounded-2xl bg-[#e2e200] py-4 text-base font-bold text-[#1000a3] hover:bg-[#d4d400] active:scale-[0.99] transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                Seguir comprando
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
