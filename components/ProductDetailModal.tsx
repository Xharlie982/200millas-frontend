"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { CartItemWithOptions, SelectedOptionsByGroup } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"

interface OptionChoice {
  id: string
  name: string
  price: number
  image?: string
}

interface OptionConfig {
  id: string
  name: string
  type: "radio" | "checkbox" | "number"
  required: boolean
  options: OptionChoice[]
  maxSelections?: number
}

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

  const optionGroups = menuItem.configuracionOpciones || []

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setSelectedOptions({}) 
      setImageLoading(true)
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

  const handleOptionClick = (groupId: string, optionId: string, groupType: "radio" | "checkbox" | "number") => {
    setSelectedOptions((prev) => {
      const newGroupOptions = { ...(prev[groupId] || {}) }
      if (groupType === 'radio') {
        return { ...prev, [groupId]: { [optionId]: 1 } }
      }
      
      if (newGroupOptions[optionId]) {
        delete newGroupOptions[optionId]
      } else {
        newGroupOptions[optionId] = 1
      }
      return { ...prev, [groupId]: newGroupOptions }
    })
  }

  const handleAddToCartClick = () => {
    const cartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: totalPrice / quantity,
      image: menuItem.image,
      quantity,
      basePrice: menuItem.price,
      selectedOptions: {} as SelectedOptionsByGroup,
    }
    onAddToCart(cartItem)
    onClose()
  }

  if (!menuItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent showCloseButton={false} className="w-[85vw] max-w-none h-[85vh] bg-[#FDFDFD] rounded-2xl p-0 border-none">
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
        <div className="relative h-full">
          <div className="grid grid-cols-1 sm:grid-cols-[600px_1fr] h-full">
            {/* Left Column: Image */}
            <div className="relative h-full w-full min-h-[400px] md:min-h-0">
              {imageLoading && <Skeleton className="absolute inset-0 rounded-l-2xl" />}
              <Image
                src={menuItem.image}
                alt={menuItem.name}
                layout="fill"
                objectFit="cover"
                className={`rounded-l-2xl transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                onLoadingComplete={() => setImageLoading(false)}
              />
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col h-full">
              <div className="p-5 pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-4">
                    <DialogTitle asChild>
                      <h2 className="text-2xl font-bold text-[#212121] font-secondary">{menuItem.name}</h2>
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">{menuItem.description}</p>
                  </div>
                  <p className="text-xl font-bold text-[#1000a3] font-primaryTitle">
                    {formatCurrency(menuItem.price)}
                  </p>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto px-5 space-y-4">
                <Accordion type="multiple" defaultValue={optionGroups.map(g => g.id)}>
                  {optionGroups.map((group) => (
                    <AccordionItem key={group.id} value={group.id} className="border-b-0">
                      <AccordionTrigger className="font-bold text-lg hover:no-underline">
                        <div className="flex items-center gap-2">
                          {group.name}
                          {group.required && (
                            <span className="text-sm font-normal bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                              Requerido ({group.maxSelections || 1})
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <ul className="space-y-2">
                          {group.options.map((option) => (
                            <li
                              key={option.id}
                              className="bg-white rounded-lg p-1 pr-2.5 flex justify-between items-center cursor-pointer"
                              onClick={() => handleOptionClick(group.id, option.id, group.type)}
                            >
                              <div className="flex items-center gap-3">
                                {option.image && (
                                  <Image
                                    src={option.image}
                                    alt={option.name}
                                    width={40}
                                    height={40}
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
                              <button className="h-8 w-8 bg-[#1000a3] rounded-full flex items-center justify-center text-white">
                                {selectedOptions[group.id]?.[option.id] ? (
                                  <Minus className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Fixed Footer */}
              <div className="mt-auto p-5 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-lg font-medium text-gray-700 whitespace-nowrap">
                    Precio base: {formatCurrency(menuItem.price)}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10 cursor-pointer" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-bold w-10 text-center">{quantity}</span>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10 cursor-pointer" onClick={() => setQuantity((q) => q + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      className="bg-[#1000a3] text-white font-bold text-lg h-12 flex-grow cursor-pointer"
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
