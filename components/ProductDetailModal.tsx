"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Minus, Plus } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CartItemWithOptions, SelectedOptionsByGroup } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import type { OptionConfig } from "@/lib/types"

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: CartItemWithOptions) => void
  menuItem: {
    id: string
    name: string
    description: string
    price: number
    image: string
    configuracionOpciones?: OptionConfig[]
  }
}

type SelectedOptions = Record<string, Record<string, number>>


export function ProductDetailModal({ isOpen, onClose, menuItem, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [imageLoading, setImageLoading] = useState(true)
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>()

  const optionGroups = useMemo(() => menuItem.configuracionOpciones || [], [menuItem.configuracionOpciones])

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setSelectedOptions({})
      setImageLoading(true)
      setActiveAccordionItem(undefined)
    }
  }, [isOpen])

  const totalPrice = useMemo(() => {
    let optionsPrice = 0
    for (const groupId in selectedOptions) {
      const group = optionGroups.find((g) => g.id === groupId)
      if (group) {
        for (const optionId in selectedOptions[groupId]) {
          const option = group.options.find((o) => o.id === optionId)
          if (option) {
            optionsPrice += option.price * selectedOptions[groupId][optionId]
          }
        }
      }
    }
    return (menuItem.price + optionsPrice) * quantity
  }, [selectedOptions, quantity, menuItem.price, optionGroups])
  
  const handleOptionClick = (groupId: string, optionId: string) => {
    const group = optionGroups.find(g => g.id === groupId)
    if (!group) return

    setSelectedOptions((prev) => {
      const newOptions = { ...prev }

      if (group.type === 'radio') {
        newOptions[groupId] = { [optionId]: 1 }
        return newOptions;
      }
      
      const newGroupOptions = { ...(newOptions[groupId] || {}) }
      const currentSelections = Object.keys(newGroupOptions).length
      const maxSelections = group.maxSelections ?? Infinity

      if (newGroupOptions[optionId]) {
        delete newGroupOptions[optionId]
      } else {
        if (currentSelections >= maxSelections) {
          return prev
        }
        newGroupOptions[optionId] = 1
      }
      
      newOptions[groupId] = newGroupOptions
      return newOptions
    });
  };

  const handleAddToCartClick = () => {
    for (const group of optionGroups) {
      if (group.required) {
        const selections = selectedOptions[group.id] ? Object.keys(selectedOptions[group.id]).length : 0;
        const min = group.maxSelections || 1;
        if (selections < min) {
          alert(`Por favor, selecciona ${min} opción(es) para "${group.name}"`);
          return;
        }
      }
    }

    const finalSelectedOptions: SelectedOptionsByGroup = {}

    for (const groupId in selectedOptions) {
      const group = optionGroups.find(g => g.id === groupId);
      if (group) {
        finalSelectedOptions[groupId] = [];
        for (const optionId in selectedOptions[groupId]) {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            finalSelectedOptions[groupId].push({
              optionId: option.id,
              name: option.name,
              price: option.price,
              quantity: selectedOptions[groupId][optionId]
            });
          }
        }
      }
    }

    const cartItem: CartItemWithOptions = {
      id: `${menuItem.id}-${JSON.stringify(selectedOptions)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: totalPrice / quantity,
      image: menuItem.image,
      quantity,
      basePrice: menuItem.price,
      selectedOptions: finalSelectedOptions,
    }
    onAddToCart(cartItem)
    onClose()
  }

  if (!menuItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent showCloseButton={false} aria-describedby="product-modal-description" className="w-[85vw] max-w-none h-[85vh] bg-[#FDFDFD] rounded-2xl p-0 border-none">
        <DialogClose asChild>
          <button
            className="absolute -top-2 -right-20 z-50 flex h-12 w-12 items-center justify-center rounded-lg text-white opacity-90 transition-opacity hover:opacity-100 cursor-pointer"
            aria-label="Cerrar modal"
            style={{ cursor: 'pointer' }}
          >
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </DialogClose>
        <div className="relative h-full min-h-0">
          <div className="flex h-full min-h-0">
            {/* --- Columna Izquierda: Imagen (Estática) --- */}
            <div className="relative w-[600px] shrink-0 h-full">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-l-2xl" />}
              <Image
                src={menuItem.image}
                alt={menuItem.name}
                fill
                className={`rounded-l-2xl object-cover transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 50vw, 600px"
              />
            </div>

            {/* --- Columna Derecha: Detalles (con Scroll interno) --- */}
            <div className="flex-1 min-h-0 grid grid-rows-[auto_1fr_auto] h-full overflow-hidden">
              {/* Fila 1: Título y Precio (Altura automática) */}
              <div className="p-5 pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-4">
                    <DialogTitle asChild>
                      <h2 className="text-2xl font-bold text-[#212121] font-secondary">{menuItem.name}</h2>
                    </DialogTitle>
                    <DialogDescription asChild>
                      <p id="product-modal-description" className="text-sm text-gray-500 mt-1">{menuItem.description}</p>
                    </DialogDescription>
                  </div>
                  <p className="text-xl font-bold text-[#1000a3] font-primaryTitle">
                    {formatCurrency(menuItem.price)}
                  </p>
                </div>
              </div>

              {/* Fila 2: Opciones (Scrollable) */}
              <div className="min-h-0 overflow-y-auto px-5 pr-3 space-y-4">
                <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                  {optionGroups.map((group) => {
                    const selections = selectedOptions[group.id] ? Object.keys(selectedOptions[group.id]).length : 0
                    const isCompleted = group.required && selections >= (group.maxSelections || 1)
                    
                    const selectedOptionNames = group.required && isCompleted 
                      ? group.options
                          .filter(opt => selectedOptions[group.id]?.[opt.id])
                          .map(opt => `${opt.name} (x1)`)
                          .join(', ')
                      : null

                    return (
                    <AccordionItem key={group.id} value={group.id} className="border-b-0">
                      <AccordionTrigger className="font-bold text-lg hover:no-underline py-4">
                        <div className="flex flex-col items-start text-left">
                           <div className="flex items-center gap-2">
                             {group.name}
                             {group.required && (
                              <span className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${isCompleted ? 'bg-green-100 text-green-800 border-green-200' : 'bg-[#FFEBEB] text-[#D40E0E] border-[#F8C1C1]'}`}>
                                {isCompleted ? 'Completado' : 'Requerido'} ({group.maxSelections || 1})
                              </span>
                            )}
                           </div>
                           {selectedOptionNames && (
                             <p className="text-xs text-gray-500 font-normal mt-1 truncate max-w-xs">
                               {selectedOptionNames}
                             </p>
                           )}
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-2">
                        <ul className="space-y-2">
                          {group.options.map((option) => {
                            const isSelected = !!selectedOptions[group.id]?.[option.id]
                            return (
                            <li
                              key={option.id}
                              className={`bg-white rounded-lg p-2 pr-2.5 flex justify-between items-center cursor-pointer border-2 ${isSelected ? 'border-blue-600' : 'border-transparent'}`}
                              onClick={() => handleOptionClick(group.id, option.id)}
                            >
                              <div className="flex items-center gap-3">
                                {option.image && (
                                  <Image
                                    src={option.image}
                                    alt={option.name}
                                    width={48}
                                    height={48}
                                    className="rounded-md object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold">{option.name}</p>
                                  {option.price > 0 && (
                                    <p className="text-sm text-gray-600">+ {formatCurrency(option.price)}</p>
                                  )}
                                </div>
                              </div>
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white transition-colors ${isSelected ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1000a3] hover:bg-blue-800'}`}>
                                {isSelected ? (
                                  <Minus className="h-5 w-5" />
                                ) : (
                                  <Plus className="h-5 w-5" />
                                )}
                              </div>
                            </li>
                          )})}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )})}
                </Accordion>
              </div>

              {/* Fila 3: Footer (Altura automática) */}
              <div className="p-5 border-t border-gray-200 bg-white rounded-br-2xl">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-lg font-medium text-gray-700 whitespace-nowrap">
                    Precio base: {formatCurrency(menuItem.price)}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-bold w-10 text-center">{quantity}</span>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer" onClick={() => setQuantity((q) => q + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="bg-[#1000a3] text-white font-bold text-lg h-12 flex-grow cursor-pointer rounded-full"
                      onClick={handleAddToCartClick}
                    >
                      Agregar ({formatCurrency(totalPrice)})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}